import { isObservable } from "../utils";
import { MaybeObservable, Observable, ObserverObject } from "../types";
import { Element, MutableArrayBase, ObservableArrayBase } from "./base";
import { proxyArray, proxyMutableArray } from "./proxy";
import { MutableArray, ObservableArray } from "./types";

export class SourceArray<T> extends ObservableArrayBase<T, Element<T>> {
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
          this.notifyChanges([element]);
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

export function observableArray<T>(
  values: MaybeObservable<T>[],
): ObservableArray<T> {
  return proxyArray(new SourceArray(values));
}

export function mutableArray<T>(values: T[] = []): MutableArray<T> {
  return proxyMutableArray(new MutableArrayBase(values));
}
