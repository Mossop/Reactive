import { MaybeObservable, Observable } from "./types";

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
