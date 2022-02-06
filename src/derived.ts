import { Comparator, Observable, ObservedValue, ObserverObject } from "./types";
import { isObservable } from "./utils";
import { ObservableBase } from "./base";

export type ObservedValues<T> = T extends [infer I]
  ? [ObservedValue<I>]
  : T extends [infer S, ...infer R]
  ? [ObservedValue<S>, ...ObservedValues<R>]
  : T;

class Joined<T extends any[]> extends ObservableBase<ObservedValues<T>> {
  #value: ObservedValues<T>;

  #observer: ObserverObject<T>;

  public constructor(...values: T) {
    super();

    let observables: Map<Observable<any>, number> = new Map();

    let observe = (value: any, observable: Observable<any>): void => {
      let index = observables.get(observable);
      if (index !== undefined) {
        this.#value = [...this.#value] as unknown as ObservedValues<T>;
        this.#value[index] = value;
        this.notify();
      }
    };

    this.#observer = { observe };

    this.#value = [] as unknown as ObservedValues<T>;
    values.forEach((val: any, index) => {
      if (isObservable(val)) {
        observables.set(val, this.#value.length);
        val.subscribe(this.#observer);

        this.#value[index] = val.value;
      } else {
        this.#value[index] = val;
      }
    });
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
  #value: T;

  #observer: ObserverObject<S>;

  public constructor(
    observable: Observable<S>,
    mapper: (value: S, previousValue?: S) => T,
    comparator: Comparator<T>,
  ) {
    super();

    let currentValue = observable.value;
    this.#value = mapper(currentValue);

    let observe = (newValue: S): void => {
      let previousValue = currentValue;
      currentValue = newValue;

      let newVal = mapper(newValue, previousValue);
      if (!comparator(newVal, this.#value)) {
        this.#value = newVal;
        this.notify();
      }
    };

    this.#observer = { observe };

    observable.subscribe(this.#observer);
  }

  public get value(): T {
    return this.#value;
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
