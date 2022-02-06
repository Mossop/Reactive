import { ObservableBase } from "./base";
import { Comparator, Observable } from "./types";

export interface Mutable<T> extends Omit<Observable<T>, "value"> {
  /**
   * Gets or sets the value of this observable.
   */
  value: T;
}

/**
 * An observable with a function to change the underlying value and notify
 * subscribers.
 */
class MutableBase<T> extends ObservableBase<T> implements Mutable<T> {
  #value: T;

  #comparator: Comparator<T>;

  public constructor(val: T, comparator: Comparator<T>) {
    super();
    this.#value = val;
    this.#comparator = comparator;
  }

  public get value(): T {
    return this.#value;
  }

  public set value(val: T) {
    if (this.#comparator(val, this.#value)) {
      return;
    }

    this.#value = val;

    this.notify();
  }
}

/**
 * Creates an observable whose value can be changed.
 *
 * @param {T} initial
 *   The initial value of the observable.
 * @param {Comparator<T>} [comparator]
 *   Used to determine if a new value is actually different from the old.
 *   Defaults to Object.is.
 */
export function mutable<T>(
  initial: T,
  comparator: Comparator<T> = Object.is,
): Mutable<T> {
  return new MutableBase(initial, comparator);
}
