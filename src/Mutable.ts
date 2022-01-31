import { Observer, Observable, Unsubscribe } from "./Observable";
import { Subscribe, Subscribers } from "./subscribe";

export type Comparator<T> = (a: T, b: T) => boolean;

/**
 * An observable with a function to change the underlying value and notify
 * subscribers.
 */
export class Mutable<T> extends Observable<T> {
  #value: T;
  #comparator: Comparator<T>;
  [Subscribers] = new Set<Observer<T>>();

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

    let observers = [...this[Subscribers]];

    for (let observer of observers) {
      try {
        observer(val, this);
      } catch (e) {}
    }
  }

  public [Subscribe](observer: Observer<T>): Unsubscribe {
    this[Subscribers].add(observer);
    return () => {
      this[Subscribers].delete(observer);
    };
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
