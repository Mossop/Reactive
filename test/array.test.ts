import { observableArray, mutable, mutableArray } from "../src";

test("array", () => {
  let source1 = mutable(56);
  let source2 = mutable(83);
  let observer = jest.fn();

  let arr = observableArray([4, 6, source1, 23, 89, source2]);
  expect(arr.value).toEqual([4, 6, 56, 23, 89, 83]);
  arr.subscribe(observer);

  expect(arr[4]).toBe(89);
  expect(arr[2]).toBe(56);

  source1.value = 19;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 83]);
  expect(arr[2]).toBe(19);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  expect([...arr]).toEqual([4, 6, 19, 23, 89, 83]);

  source2.value = 3;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 3]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.destroy();
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 3]);

  source1.value = 190;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 3]);
  expect(observer).not.toHaveBeenCalled();
});

test("mutableArray", () => {
  let observer = jest.fn();

  let arr = mutableArray([4, 6, 56, 23, 89, 83]);
  expect(arr.value).toEqual([4, 6, 56, 23, 89, 83]);
  arr.subscribe(observer);

  arr[2] = 19;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 83]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr[5] = 3;
  expect(arr.value).toEqual([4, 6, 19, 23, 89, 3]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.delete(1);
  expect(arr.value).toEqual([4, 19, 23, 89, 3]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.delete(2, 0);
  expect(arr.value).toEqual([4, 19, 23, 89, 3]);
  expect(observer).not.toHaveBeenCalled();

  arr.delete(2, 7);
  expect(arr.value).toEqual([4, 19]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr[2] = 56;
  arr[3] = 23;
  arr[4] = 6;
  expect(arr.value).toEqual([4, 19, 56, 23, 6]);
  expect(observer).toHaveBeenCalledTimes(3);
  expect(observer.mock.calls[0][0]).toEqual([4, 19, 56]);
  expect(observer.mock.calls[1][0]).toEqual([4, 19, 56, 23]);
  expect(observer.mock.calls[2][0]).toEqual([4, 19, 56, 23, 6]);
  observer.mockClear();

  arr.delete(-5, 7);
  expect(arr.value).toEqual([56, 23, 6]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.set(1, 67);
  expect(arr.value).toEqual([56, 67, 6]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.insert(1, 68, 72);
  expect(arr.value).toEqual([56, 68, 72, 67, 6]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.set(3, 1, 4, 6, 7);
  expect(arr.value).toEqual([56, 68, 72, 1, 4, 6, 7]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.moveWithin(3, 1, 3);
  expect(arr.value).toEqual([56, 1, 4, 6, 68, 72, 7]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.moveWithin(0, 2);
  expect(arr.value).toEqual([1, 56, 4, 6, 68, 72, 7]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();

  arr.value = [1, 2, 3];
  expect(arr.value).toEqual([1, 2, 3]);
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(arr.value);
  observer.mockClear();
});
