import { Observable } from "../observable";

export type Order<T> = (a: T, b: T) => number;

export interface ObservableArray<T> extends Observable<T[]>, Iterable<T> {
  /**
   * Gets an element in the array. Throws an error if getting outside the
   * current bounds of the array.
   */
  readonly [key: number]: T;

  /**
   * The length of the array.
   */
  readonly length: number;
}

export interface MutableArray<T>
  extends Omit<ObservableArray<T>, number | "value"> {
  /**
   * Sets or gets an element in the array. Throws an error if getting outside
   * the current bounds of the array or setting more then one element beyond
   * the end of the array.
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
