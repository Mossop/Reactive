export type ObserverFn<T> = (value: T, observable: Observable<T>) => void;
export interface ObserverObject<T> {
  readonly observe: ObserverFn<T>;
}

export type Observer<T> = ObserverObject<T> | ObserverFn<T>;
export type Unsubscribe = () => void;

export type ObservedValue<T> = T extends Observable<infer I> ? I : T;
export type MaybeObservable<T> = T | Observable<T>;

export interface Observable<T> {
  /**
   * Gets the current value of the observable.
   */
  readonly value: T;

  /**
   * Subscribes to listen to changes to the value of this observable.
   *
   * @param {Observer<T>} observer
   *   A callback to call whenever the observable's value changes.
   * @returns {Unsubscribe}
   *   A callback to call to unsubscribe from changes to this observable.
   */
  subscribe(observer: Observer<T>): Unsubscribe;
}
