import { Comparator } from "../mutable";
import { ObservableBase } from "../base";
import { GetElement } from "./proxy";
import { MutableArray, ObservableArray } from "./types";

export interface Element<T> {
  value: T;
}

export abstract class ObservableArrayBase<T, E extends Element<T>>
  extends ObservableBase<T[]>
  implements Omit<ObservableArray<T>, number>
{
  #values: T[] = [];

  protected constructor(protected readonly storage: E[]) {
    super();
    this.#values = this.storage.map((val: E): T => val.value);
  }

  public get value(): T[] {
    return this.#values;
  }

  public get length(): number {
    return this.#values.length;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected notifyChanges(_changedElements: E[] = []): void {
    this.#values = this.storage.map((val: E): T => val.value);

    this.notify();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onSourceChanged(changedElements: E[]): void {}

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
  public constructor(
    values: T[] = [],
    protected comparator: Comparator<T> = Object.is,
  ) {
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

    let changedElements: Element<T>[] = [];

    let index = target;
    for (let value of values) {
      let element = this.storage[index];
      if (element) {
        if (!this.comparator(element.value, value)) {
          element.value = value;
          changedElements.push(element);
        }
      } else {
        this.storage[index] = { value };
      }

      index++;
    }

    this.storage.splice(
      target,
      values.length,
      ...values.map((value: T): Element<T> => ({ value })),
    );

    this.notifyChanges();
  }
}
