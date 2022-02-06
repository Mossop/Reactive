import { Observers } from "./observers";
import { Observable, Observer, Unsubscribe } from "./types";

/**
 * An base observable value with a given type.
 *
 * Serializes correctly over JSON, can be used in limited circumstances as a
 * primitive but to guarantee correct access use the `value` property.
 */
export abstract class ObservableBase<T> implements Observable<T> {
  public abstract readonly value: T;

  protected readonly observers: Observers<T> = new Observers(this);

  public subscribe(observer: Observer<T>): Unsubscribe {
    return this.observers.subscribe(observer);
  }

  protected notify(): void {
    this.observers.notify(this.value);
  }

  public valueOf(): T {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }

  public toJSON(): T {
    return this.value;
  }
}
