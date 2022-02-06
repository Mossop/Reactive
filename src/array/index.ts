import { isObservable } from "../utils";
import {
  MaybeObservable,
  Observable,
  ObserverObject,
  Comparator,
} from "../types";
import { Element, MutableArrayBase, ObservableArrayBase } from "./base";
import { proxyArray, proxyMutableArray } from "./proxy";
import { MutableArray, ObservableArray } from "./types";

export class SourceArray<T> extends ObservableArrayBase<T> {
  #observer: ObserverObject<T>;

  public constructor(values: MaybeObservable<T>[]) {
    super(
      values.map((value: MaybeObservable<T>): Element<T> => {
        if (isObservable(value)) {
          return { value: value.value };
        }
        return { value };
      }),
    );

    let observables: Map<Observable<any>, number> = new Map();

    let observe = (value: any, observable: Observable<any>): void => {
      let index = observables.get(observable);
      if (index !== undefined) {
        let element = this.storage[index];
        if (element) {
          element.value = value;
          this.notifyChanges(new Set([element]));
        }
      }
    };

    this.#observer = { observe };

    values.forEach((value, index) => {
      if (isObservable(value)) {
        observables.set(value, index);
        value.subscribe(this.#observer);
      }
    });
  }
}

/**
 * Creates an observable array from a list of values that may include
 * Observables.
 *
 * @param {MaybeObservable<T>[]} values
 *   The list of initial values.
 */
export function observableArray<T>(
  values: MaybeObservable<T>[],
): ObservableArray<T> {
  return proxyArray(new SourceArray(values));
}

/**
 * Creates an array whose values can be modified after creation.
 *
 * @param {T[]} [values]
 *   The initial values for the array.
 * @param {Comparator<T>} [comparator]
 *   Used to determine if new values are different from previous values.
 *   Defaults to Object.is.
 */
export function mutableArray<T>(
  values: T[] = [],
  comparator: Comparator<T> = Object.is,
): MutableArray<T> {
  return proxyMutableArray(new MutableArrayBase(values, comparator));
}
