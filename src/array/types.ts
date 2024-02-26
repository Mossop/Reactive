import { Observable, Comparator, MaybeObservable } from "../types";

export type Order<T> = (a: T, b: T) => number;

export interface ObservableArray<T> extends Observable<T[]>, Iterable<T> {
  /**
   * Gets an element in the array. Returns undefined if outside the bounds of
   * the array.
   */
  readonly [key: number]: T;

  /**
   * The length of the array.
   */
  readonly length: number;

  /**
   * Converts this array into another array by mapping each element with a
   * mapping function. The mapping function will only be called when an
   * element's value has changed or new elements are added. Changes to the order
   * of elements will not cause them to be mapped again. The mapping function
   * may itself be an observable in which case whenever its value changes the
   * entire array is re-mapped.
   *
   * @param {MaybeObservable<(value: T) => R>} mapper
   *   The mapping function called to generate values for the new array.
   * @param {Comparator<R>} [comparator]
   *   Used to determine if the result of mapping is actually a different value
   *   to any previously generated. Used to reduce downstream changes. Defaults
   *   to Object.is.
   * @returns {ObservableArray<R>}
   */
  map<R>(
    mapper: MaybeObservable<(value: T) => R>,
    comparator?: Comparator<R>,
  ): ObservableArray<R>;
}

export interface MutableArray<T>
  extends Omit<ObservableArray<T>, number | "value"> {
  /**
   * Sets or gets an element in the array. Throws an error if setting more then
   * one element beyond the end of the array.
   */
  [key: number]: T;

  /**
   * Gets or sets the entire array of elements.
   */
  value: T[];

  /**
   * Moves the elements within the array. Takes a sequence of elements, removes
   * them from the array and then re-inserts them somewhere else re-ordering
   * the remaining elements such that the array maintains the same length.
   *
   * @param {number} source
   *   The index of the element at the start of the range to be moved.
   * @param {number} [target]
   *   The index of where to insert the elements. Elements will be inserted
   *   before the element currently at this index. Defaults to the end of
   *   the array.
   * @param {number} [length]
   *   The number of elements to move. Defaults to one.
   */
  moveWithin(source: number, target?: number, length?: number): void;

  /**
   * Deletes elements from the array. Re-orders the following elements so the
   * length of the array shrinks.
   *
   * @param {number} start
   *   The index of the first element to delete.
   * @param {number} [length]
   *   The number of elements to delete. Defaults to 1.
   */
  delete(start: number, length?: number): void;

  /**
   * Inserts elements into the array. Re-orders the following elements so the
   * size of the array grows.
   *
   * @param {number} target
   *   The index to insert at. Elements are inserted before the element at this
   *   index.
   * @param {T[]} elements
   *   The elements to insert.
   */
  insert(target: number, ...elements: T[]): void;

  /**
   * Sets elements in the array. Overwrites any existing elements. The array
   * will grow in size if setting after the current end of the array.
   *
   * @param {number} target
   *   The index to start setting at.
   * @param {T[]} elements
   *   The elements to set.
   */
  set(target: number, ...elements: T[]): void;
}
