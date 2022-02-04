import { Comparator } from "./mutable";
import {
  isObservable,
  Observable,
  ObservableBase,
  ObservedValue,
  Unsubscribe,
} from "./observable";

export type ObservedValues<T> = T extends [infer I]
  ? [ObservedValue<I>]
  : T extends [infer S, ...infer R]
  ? [ObservedValue<S>, ...ObservedValues<R>]
  : T;

class Joined<T extends any[]> extends ObservableBase<ObservedValues<T>> {
  #value: ObservedValues<T>;

  #unsubscribe: () => void;

  public constructor(...observables: T) {
    super();

    let callbacks: (() => void)[] = [];

    this.#value = [] as unknown as ObservedValues<T>;
    observables.forEach((val: any, index) => {
      if (isObservable(val)) {
        this.#value[index] = val.value;

        callbacks.push(
          val.subscribe((newValue) => {
            this.#value = [...this.#value] as ObservedValues<T>;
            this.#value[index] = newValue;

            this.notify();
          }),
        );
      } else {
        this.#value[index] = val;
      }
    });

    this.#unsubscribe = () => {
      for (let cb of callbacks) {
        cb();
      }
    };
  }

  public override destroy(): void {
    super.destroy();
    this.#unsubscribe();
  }

  public get value(): ObservedValues<T> {
    return this.#value;
  }
}

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
  return new Joined(...values);
}

class Derived<S, T> extends ObservableBase<T> {
  #unsubscribe: Unsubscribe;

  #value: T;

  public constructor(
    observable: Observable<S>,
    mapper: (value: S, previousValue?: S) => T,
    comparator: Comparator<T>,
  ) {
    super();

    let currentValue = observable.value;
    this.#value = mapper(currentValue);

    this.#unsubscribe = observable.subscribe((newValue) => {
      let previousValue = currentValue;
      currentValue = newValue;

      let newVal = mapper(newValue, previousValue);
      if (!comparator(newVal, this.#value)) {
        this.#value = newVal;
        this.notify();
      }
    });
  }

  public get value(): T {
    return this.#value;
  }

  public override destroy() {
    super.destroy();
    this.#unsubscribe();
  }
}

/**
 * Derives a new observable from an existing observable.
 *
 * A callback is called
 * whever the given observable changes to generate the new value for the
 * derived observable.
 *
 * @param {ObservableBase} observable
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
  mapper: (value: V, previousValues?: V) => R,
  comparator: Comparator<R> = Object.is,
) {
  return new Derived(observable, mapper, comparator);
}
