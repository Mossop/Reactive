import {
  isObservable,
  Observable,
  ObservedValue,
  Unsubscribe,
  valueOf,
  Wrapped,
} from "./Observable";
import { Comparator, mutable, Mutable } from "./Mutable";
import { subscribe } from "./subscribe";

const ObservableRegistry = new FinalizationRegistry(
  (cleanup: () => void): void => cleanup(),
);

export type ObservedValues<T> = T extends [infer I]
  ? [ObservedValue<I>]
  : T extends [infer S, ...infer R]
  ? [ObservedValue<S>, ...ObservedValues<R>]
  : T;

/**
 * Joins a list of values, observable or not into an observable array of those
 * values.
 *
 * Useful for deriving from multiple values.
 *
 * @param {any[]} values
 *   The list of values to join.
 * @returns {Observable} An observable array of the given values.
 */
export function join<O extends any[]>(
  ...values: O
): Observable<ObservedValues<O>> {
  let mutableValue: Mutable<ObservedValues<O>>;
  let currentValues: ObservedValues<O> = [] as unknown as ObservedValues<O>;

  let cleanups: Unsubscribe[] = [];

  values.forEach(<T>(value: T, index: number) => {
    currentValues[index] = valueOf(value);

    if (isObservable(value)) {
      cleanups.push(
        subscribe(value, (newValue) => {
          currentValues = currentValues.slice() as ObservedValues<O>;
          currentValues[index] = newValue;
          mutableValue.value = currentValues;
        }),
      );
    }
  });

  mutableValue = mutable(currentValues);

  let immutable = new Wrapped(mutableValue);
  ObservableRegistry.register(immutable, () => {
    for (let cleanup of cleanups) {
      cleanup();
    }
  });

  return immutable;
}

/**
 * Derives a new observable from an existing observable.
 *
 * A callback is called
 * whever the given observable changes to generate the new value for the
 * derived observable.
 *
 * @param {Observable} observable
 *   The observable to derive from.
 * @param {Callback} callback
 *   A callback called with every new value. Subsequent calls will also be
 *   called with the previous value. The return from this function is used
 *   as the new value for the derived observable.
 * @param {Comparator} comparator
 *   Optionally allows filtering for actual changes to the result.
 */
export function derive<V, R>(
  observable: Observable<V>,
  callback: (value: V, previousValues?: V) => R,
  comparator: Comparator<R> = Object.is,
) {
  let currentValue = observable.value;
  let mutableValue = new Mutable(callback(currentValue), comparator);

  let cleanup = subscribe(observable, (newValue: V) => {
    let previousValue = currentValue;
    currentValue = newValue;
    mutableValue.value = callback(newValue, previousValue);
  });

  let immutable = new Wrapped(mutableValue);
  ObservableRegistry.register(immutable, cleanup);

  return immutable;
}

/**
 * Template string function to generate an observable string including the
 * observed values of the template parts.
 */
export function os(
  [...parts]: TemplateStringsArray,
  ...params: unknown[]
): Observable<string> {
  let joined: unknown[] = [];
  while (parts.length) {
    joined.push(parts.shift());
    if (params.length) {
      joined.push(params.shift());
    }
  }

  while (params.length) {
    joined.push(params.shift());
  }

  return derive(join(...joined), (strs: unknown[]): string => strs.join(""));
}

export function resolve<V>(
  observable: Observable<V>,
): Observable<Awaited<V> | undefined>;
export function resolve<V>(
  observable: Observable<V>,
  initial: Awaited<V>,
): Observable<Awaited<V>>;
export function resolve<V>(
  observable: Observable<V>,
  initial?: Awaited<V>,
): Observable<Awaited<V> | undefined> {
  let mutableValue = mutable(initial);
  let pending: V[] = [];

  let resolvePromise = async (promise: V) => {
    pending.push(promise);

    try {
      let value = await promise;

      let position = pending.indexOf(promise);
      if (position < 0) {
        // This value has been superceded.
        return;
      }

      pending.splice(0, position + 1);
      mutableValue.value = value;
    } catch (e) {
      console.error(e);
    }
  };

  let cleanup = subscribe(observable, resolvePromise);

  let immutable = new Wrapped(mutableValue);
  ObservableRegistry.register(immutable, cleanup);

  resolvePromise(observable.value);

  return immutable;
}
