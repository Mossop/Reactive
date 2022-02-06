import { ObservableBase } from "../base";
import { Comparator } from "../types";
import type { DerivedArray } from "./derived";
import { GetElement, proxyArray } from "./proxy";
import { MutableArray, ObservableArray } from "./types";

export interface Element<T> {
  value: T;
}

export abstract class ObservableArrayBase<T, TE extends Element<T> = Element<T>>
  extends ObservableBase<T[]>
  implements Omit<ObservableArray<T>, number>
{
  #values: T[] = [];

  #derived: WeakRef<DerivedArray<T, any, any>>[] = [];

  protected constructor(protected storage: TE[]) {
    super();
    this.#values = this.storage.map((val: TE): T => val.value);
  }

  public get value(): T[] {
    return this.#values;
  }

  public get length(): number {
    return this.#values.length;
  }

  protected notifyChanges(changedElements?: Set<TE>): void {
    this.#values = this.storage.map((val: TE): T => val.value);

    for (let derived of this.#derived) {
      try {
        derived.deref()?.onSourceChanged(this.storage, changedElements);
      } catch (e) {
        // Ignore errors
      }
    }

    this.notify();
  }

  public map<R>(
    mapper: (value: T) => R,
    comparator: Comparator<R> = Object.is,
  ): ObservableArray<R> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    let impl = new MappedArray(this, this.storage, mapper, comparator);
    this.#derived.push(new WeakRef(impl));
    return proxyArray(impl);
  }

  public [GetElement](index: number): T | undefined {
    return this.#values[index];
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.#values[Symbol.iterator]();
  }
}

export class MutableArrayBase<T>
  extends ObservableArrayBase<T, Element<T>>
  implements Omit<MutableArray<T>, number>
{
  public constructor(values: T[], protected comparator: Comparator<T>) {
    super(values.map((value: T): Element<T> => ({ value })));
  }

  public override get value(): T[] {
    return super.value;
  }

  public override set value(values: T[]) {
    this.storage.splice(0, this.storage.length);
    this.set(0, ...values);
  }

  moveWithin(
    source: number,
    target: number = this.length,
    length: number = 1,
  ): void {
    if (length == 0) {
      return;
    }

    if (source < 0 || source >= this.storage.length) {
      throw new Error("Cannot move from outside the current array's bounds.");
    }

    if (source + length > this.storage.length) {
      throw new Error("Cannot move from outside the current array's bounds.");
    }

    if (target >= source && target <= source + length) {
      throw new Error("Target must be outside of the range being moved.");
    }

    let elements = this.storage.splice(source, length);
    let spliceIndex = target > source ? target - length : target;
    this.storage.splice(spliceIndex, 0, ...elements);

    this.notifyChanges();
  }

  delete(target: number, length: number = 1): void {
    if (length == 0) {
      return;
    }

    if (target >= this.storage.length) {
      return;
    }

    let end = target + length;
    if (end <= 0) {
      return;
    }

    let start = Math.max(0, target);
    end = Math.min(this.storage.length, end);

    if (end == start) {
      return;
    }

    this.storage.splice(start, end - start);
    this.notifyChanges();
  }

  insert(target: number, ...elements: T[]): void {
    if (elements.length == 0) {
      return;
    }

    if (target > this.storage.length || target < 0) {
      throw new Error("Cannot insert outside the current bounds of the array.");
    }

    this.storage.splice(
      target,
      0,
      ...elements.map((value: T): Element<T> => ({ value })),
    );

    this.notifyChanges();
  }

  set(target: number, ...values: T[]): void {
    if (values.length == 0) {
      return;
    }

    if (target > this.storage.length || target < 0) {
      throw new Error("Cannot set outside the current bounds of the array.");
    }

    let changedElements = new Set<Element<T>>();

    let index = target;
    for (let value of values) {
      let element = this.storage[index];
      if (element) {
        if (!this.comparator(element.value, value)) {
          element.value = value;
          changedElements.add(element);
        }
      } else {
        this.storage[index] = { value };
      }

      index++;
    }

    this.notifyChanges(changedElements);
  }
}

// This is required to break an import cycle.
// eslint-disable-next-line import/first, import/no-cycle
import { MappedArray } from "./derived";
