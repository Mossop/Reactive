import { subscribe, Subscribe } from "./subscribe";

export type Observer<T> = (val: T, observer: Observable<T>) => void;
export type ObservedValue<T> = T extends Observable<infer I> ? I : T;
export type Unsubscribe = () => void;

/**
 * An observable value with a given type.
 *
 * Serializes correctly over JSON, can be used in limited circumstances as a
 * primitive but to guarantee correct access use the `value` property.
 */
export abstract class Observable<T> {
  public abstract readonly value: T;

  public valueOf(): T {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }

  public toJSON(): T {
    return this.value;
  }

  public abstract [Subscribe](observer: Observer<T>): Unsubscribe;
}

/**
 * Tests whether a value is observable.
 *
 * @param {unknown} value
 *   The value to test.
 * @returns {boolean} True if the value is observable.
 */
export const isObservable = (value: unknown): value is Observable<any> =>
  value instanceof Observable;

/**
 * A wrapper for an observable, usually to hide some functionality.
 */
export class Wrapped<T> extends Observable<T> {
  #inner: Observable<T>;

  /**
   * Creates the wrapper.
   *
   * This wrapper will reflect the inner's value and subscribers will receive
   * updates whenever the inner's value changes.
   *
   * @param {Observable<T>} inner
   *   The observable to wrap.
   */
  public constructor(inner: Observable<T>) {
    super();
    this.#inner = inner;
  }

  public get value(): T {
    return this.#inner.value;
  }

  public [Subscribe](observer: Observer<T>): Unsubscribe {
    return subscribe(this.#inner, (newValue) => observer(newValue, this));
  }
}

/**
 * Returns the value of a potentially observable value.
 *
 * @param {any} value
 *   The value to return.
 * @returns {any} If the passed value was an Observable then returns its actual
 *   value otherwise returns the passed value.
 */
export function valueOf<T>(value: T | Observer<T>): ObservedValue<T> {
  if (isObservable(value)) {
    return value.value;
  }

  // @ts-expect-error
  return value;
}
