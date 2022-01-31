import type { Observable, Observer, Unsubscribe } from "./Observable";

export const Subscribe = Symbol();
export const Subscribers = Symbol();

/**
 * Subscribes to an observable value.
 *
 * @param {Observable<T>} observable
 *   The observable to subscribe to.
 * @param {Observer<T>} observer
 *   The observer to call whenever the observable changes.
 * @returns {Unsubscribe} A function to call to unsubscribe.
 */
export function subscribe<T>(
  observable: Observable<T>,
  observer: Observer<T>,
): Unsubscribe {
  return observable[Subscribe](observer);
}
