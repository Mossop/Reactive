import { Observer, Observable, ObservableValue } from "./Observable";

export type Comparator<T> = (a: T, b: T) => boolean;

export class Mutable<T> extends Observable<T> {
  #value: T;
  #comparator: Comparator<T>;
  #observers = new Set<Observer<T>>();

  public constructor(val: T, comparator: Comparator<T> = Object.is) {
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

    let observers = [...this.#observers];

    for (let observer of observers) {
      try {
        observer(val, this);
      } catch (e) {}
    }
  }

  public observe(observer: Observer<T>): () => void {
    this.#observers.add(observer);
    return () => {
      this.#observers.delete(observer);
    };
  }
}

export function mutable<T>(
  initial: T,
  comparator: Comparator<T> = Object.is,
): Mutable<T> & ObservableValue<T> {
  return new Mutable(initial, comparator) as Mutable<T> & ObservableValue<T>;
}
