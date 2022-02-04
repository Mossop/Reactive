export type Observer<T> = (val: T, observer: Observable<T>) => void;
export type ObservedValue<T> = T extends Observable<infer I> ? I : T;
export type Unsubscribe = () => void;
export type MaybeObservable<T> = T | Observable<T>;

export interface Observable<T> {
  /**
   * Gets the current value of the observable.
   */
  readonly value: T;

  /**
   * Subscribes to listen to changes to the value of this ovservable.
   *
   * @param {Observer<T>} observer
   *   A callback to call whenever the observable's value changes.
   * @returns {Unsubscribe}
   *   A callback to call to unsubscribe from changes to this observable.
   */
  subscribe(observer: Observer<T>): Unsubscribe;

  /**
   * Destroys this observable. It will no longer notify subscribers of changes
   * and in the case of a derived observable will no longer listen to changes.
   */
  destroy(): void;
}

/**
 * An observable value with a given type.
 *
 * Serializes correctly over JSON, can be used in limited circumstances as a
 * primitive but to guarantee correct access use the `value` property.
 */
export abstract class ObservableBase<T> implements Observable<T> {
  public abstract readonly value: T;

  protected readonly observers: Set<Observer<T>> = new Set();

  protected notify(): void {
    for (let observer of [...this.observers]) {
      try {
        observer(this.value, this);
      } catch (e) {
        // Ignore errors.
      }
    }
  }

  public subscribe(observer: Observer<T>): Unsubscribe {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  public destroy(): void {
    this.observers.clear();
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

/**
 * Tests whether a value is observable.
 *
 * @param {unknown} value
 *   The value to test.
 * @returns {boolean} True if the value is observable.
 */
export const isObservable = <T = any>(
  value: MaybeObservable<T>,
): value is Observable<T> =>
  value && typeof value == "object" && "value" in value && "subscribe" in value;

/**
 * Returns the value of a potentially observable value.
 *
 * @param {any} value
 *   The value to return.
 * @returns {any} If the passed value was an Observable then returns its actual
 *   value otherwise returns the passed value.
 */
export function valueOf<T>(value: Observable<T>): T;
export function valueOf<T>(value: T | Observable<T>): T;
export function valueOf<T>(value: T | Observable<T>): T {
  if (isObservable(value)) {
    return value.value;
  }

  return value;
}
