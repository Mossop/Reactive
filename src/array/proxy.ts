import type { ObservableArrayBase } from "./base";
import { MutableArray, ObservableArray } from "./types";

export const GetElement = Symbol("GetElement");

function asNumber(prop: string | symbol): number | undefined {
  if (typeof prop != "string") {
    return undefined;
  }

  let val = parseInt(prop, 10);
  if (val.toString() === prop) {
    return val;
  }

  return undefined;
}

const ReadonlyArrayHandler = {
  get(target: any, property: string | symbol): unknown {
    let index = asNumber(property);
    if (index !== undefined) {
      return target[GetElement](property);
    }

    let value = target[property];
    if (typeof value === "function") {
      return value.bind(target);
    }
    return value;
  },
};

const ArrayHandler = {
  set(
    target: MutableArray<unknown>,
    property: string | symbol,
    value: unknown,
  ): boolean {
    let index = asNumber(property);
    if (index !== undefined) {
      target.set(index, value);
    } else {
      // @ts-expect-error
      // eslint-disable-next-line no-param-reassign
      target[property] = value;
    }

    return true;
  },

  ...ReadonlyArrayHandler,
};

export function proxyMutableArray<T>(arrayImpl: any): MutableArray<T> {
  return new Proxy(arrayImpl, ArrayHandler);
}

export function proxyArray<T>(
  arrayImpl: ObservableArrayBase<T, any>,
): ObservableArray<T> {
  return new Proxy(arrayImpl, ReadonlyArrayHandler);
}
