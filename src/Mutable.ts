import { ObservableBase } from "./observable";

export type Comparator<T> = (a: T, b: T) => boolean;

/**
 * An observable with a function to change the underlying value and notify
 * subscribers.
 */
class Mutable<T> extends ObservableBase<T> {
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
 */
export function mutable<T>(
  initial: T,
  comparator: Comparator<T> = Object.is,
): Mutable<T> {
  return new Mutable(initial, comparator);
}
