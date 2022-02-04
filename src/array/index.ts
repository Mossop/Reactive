import { isObservable, MaybeObservable, Unsubscribe } from "../observable";
import { Element, MutableArrayBase, ObservableArrayBase } from "./base";
import { proxyArray, proxyMutableArray } from "./proxy";
import { MutableArray, ObservableArray } from "./types";

export class SourceArray<T> extends ObservableArrayBase<T, Element<T>> {
  #unsubscribe: Unsubscribe;

  public constructor(values: MaybeObservable<T>[]) {
    super(
      values.map((value: MaybeObservable<T>): Element<T> => {
        if (isObservable(value)) {
          return { value: value.value };
        }
        return { value };
      }),
    );

    let callbacks: Unsubscribe[] = [];
    values.forEach((value, index) => {
      if (isObservable(value)) {
        callbacks.push(
          value.subscribe((newValue) => {
            let element = this.storage[index];
            if (element) {
              element.value = newValue;
              this.notifyChanges([element]);
            }
          }),
        );
      }
    });

    this.#unsubscribe = () => {
      for (let unsub of callbacks) {
        unsub();
      }
    };
  }

  public override destroy(): void {
    this.#unsubscribe();
    super.destroy();
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
