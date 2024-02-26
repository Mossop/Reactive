import { observableArray, mutable, mutableArray } from "../src";

test("array", () => {
  let source1 = mutable(56);
  let source2 = mutable(83);
  let observer = jest.fn();

  let arr = observableArray([4, 6, source1, 23, 89, source2]);
  expect(arr.value).toEqual([4, 6, 56, 23, 89, 83]);
  expect(arr.length).toBe(6);
  arr.subscribe(observer);

  expect(arr[4]).toBe(89);
  expect(arr[2]).toBe(56);

  source1.value = 19;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 83]);
  expect(arr.length).toBe(6);
  expect(arr[2]).toBe(19);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  expect([...arr]).toEqual([4, 6, 19, 23, 89, 83]);

  source2.value = 3;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 3]);
  expect(arr.length).toBe(6);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();
});

test("mutableArray", () => {
  let observer = jest.fn();

  let arr = mutableArray([4, 6, 56, 23, 89, 83]);
  expect(arr.length).toBe(6);
  expect(arr.value).toEqual([4, 6, 56, 23, 89, 83]);
  arr.subscribe(observer);

  arr[2] = 19;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 83]);
  expect(arr.length).toBe(6);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr[5] = 3;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 3]);
  expect(arr.length).toBe(6);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.delete(1);
  expect(arr.value).toEqual([4, 19, 23, 89, 3]);
  expect(arr.length).toBe(5);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.delete(2, 0);
  expect(arr.value).toEqual([4, 19, 23, 89, 3]);
  expect(arr.length).toBe(5);
  expect(observer).not.toHaveBeenCalled();

  arr.delete(2, 7);
  expect(arr.value).toEqual([4, 19]);
  expect(arr.length).toBe(2);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr[2] = 56;
  arr[3] = 23;
  arr[4] = 6;
  expect(arr.value).toEqual([4, 19, 56, 23, 6]);
  expect(arr.length).toBe(5);
  expect(observer).toHaveBeenCalledTimes(3);
  expect(observer.mock.calls[0][0]).toEqual([4, 19, 56]);
  expect(observer.mock.calls[1][0]).toEqual([4, 19, 56, 23]);
  expect(observer.mock.calls[2][0]).toEqual([4, 19, 56, 23, 6]);
  observer.mockClear();

  arr.delete(-5, 7);
  expect(arr.value).toEqual([56, 23, 6]);
  expect(arr.length).toBe(3);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.set(1, 67);
  expect(arr.value).toEqual([56, 67, 6]);
  expect(arr.length).toBe(3);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.insert(1, 68, 72);
  expect(arr.value).toEqual([56, 68, 72, 67, 6]);
  expect(arr.length).toBe(5);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.set(3, 1, 4, 6, 7);
  expect(arr.value).toEqual([56, 68, 72, 1, 4, 6, 7]);
  expect(arr.length).toBe(7);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.moveWithin(3, 1, 3);
  expect(arr.value).toEqual([56, 1, 4, 6, 68, 72, 7]);
  expect(arr.length).toBe(7);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.moveWithin(0, 2);
  expect(arr.value).toEqual([1, 56, 4, 6, 68, 72, 7]);
  expect(arr.length).toBe(7);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.value = [1, 2, 3];
  expect(arr.value).toEqual([1, 2, 3]);
  expect(arr.length).toBe(3);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();
});

test("mapped array basics", () => {
  let arr = mutableArray([4, 6, 56, 23, 89, 83]);
  expect(arr.length).toBe(6);
  expect(arr.value).toEqual([4, 6, 56, 23, 89, 83]);

  let mapped = arr.map((val) => val * 2);
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([8, 12, 112, 46, 178, 166]);

  arr[4] = 3;
  expect(arr.length).toBe(6);
  expect(arr.value).toEqual([4, 6, 56, 23, 3, 83]);
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([8, 12, 112, 46, 6, 166]);
  expect(mapped[4]).toBe(6);

  arr.delete(1);
  expect(arr.length).toBe(5);
  expect(arr.value).toEqual([4, 56, 23, 3, 83]);
  expect(mapped.length).toBe(5);
  expect(mapped.value).toEqual([8, 112, 46, 6, 166]);

  arr[5] = 5;
  expect(arr.length).toBe(6);
  expect(arr.value).toEqual([4, 56, 23, 3, 83, 5]);
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([8, 112, 46, 6, 166, 10]);
});

test("mapped array identities", () => {
  let arr = mutableArray([4, 6, 56, 23, 89, 83]);
  expect(arr.length).toBe(6);
  expect(arr.value).toEqual([4, 6, 56, 23, 89, 83]);

  let mapped = arr.map(() => ({}));
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([{}, {}, {}, {}, {}, {}]);

  let values = [...mapped];

  expect(values[0]).toBe(mapped[0]);
  expect(values[1]).toBe(mapped[1]);
  expect(values[2]).toBe(mapped[2]);
  expect(values[3]).toBe(mapped[3]);
  expect(values[4]).toBe(mapped[4]);
  expect(values[5]).toBe(mapped[5]);

  arr[2] = 6;
  expect(arr.value).toEqual([4, 6, 6, 23, 89, 83]);
  expect(mapped[0]).toBe(values[0]);
  expect(mapped[1]).toBe(values[1]);
  expect(mapped[2]).not.toBe(values[2]);
  expect(mapped[3]).toBe(values[3]);
  expect(mapped[4]).toBe(values[4]);
  expect(mapped[5]).toBe(values[5]);

  values = [...mapped];

  arr[3] = 23;
  expect(arr.value).toEqual([4, 6, 6, 23, 89, 83]);
  expect(mapped[0]).toBe(values[0]);
  expect(mapped[1]).toBe(values[1]);
  expect(mapped[2]).toBe(values[2]);
  expect(mapped[3]).toBe(values[3]);
  expect(mapped[4]).toBe(values[4]);
  expect(mapped[5]).toBe(values[5]);

  arr.insert(2, 87, 98);
  expect(arr.value).toEqual([4, 6, 87, 98, 6, 23, 89, 83]);
  expect(mapped[0]).toBe(values[0]);
  expect(mapped[1]).toBe(values[1]);
  expect(mapped[4]).toBe(values[2]);
  expect(mapped[5]).toBe(values[3]);
  expect(mapped[6]).toBe(values[4]);
  expect(mapped[7]).toBe(values[5]);

  values = [...mapped];

  arr.delete(4, 2);
  expect(arr.value).toEqual([4, 6, 87, 98, 89, 83]);
  expect(mapped[0]).toBe(values[0]);
  expect(mapped[1]).toBe(values[1]);
  expect(mapped[2]).toBe(values[2]);
  expect(mapped[3]).toBe(values[3]);
  expect(mapped[4]).toBe(values[6]);
  expect(mapped[5]).toBe(values[7]);
});

test("Observable mapping function", () => {
  let mapper = mutable((val: number): number => val * 2);

  let arr = mutableArray([4, 6, 56, 23, 89, 83]);
  let mapped = arr.map(mapper);
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([8, 12, 112, 46, 178, 166]);

  mapper.value = (val: number): number => val * 3;
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([12, 18, 168, 69, 267, 249]);

  arr[4] = 2;
  expect(mapped.length).toBe(6);
  expect(mapped.value).toEqual([12, 18, 168, 69, 6, 249]);
});
