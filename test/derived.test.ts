import { derive, join, mutable } from "../src";

test("Derive updates correctly", () => {
  let source = mutable(6);

  let val = derive(source, (value: number) => value + 7);
  let observer = jest.fn();
  val.subscribe(observer);
  expect(val.value).toBe(13);

  source.value = 8;
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual(15);
  expect(observer.mock.calls[0][1]).toBe(val);
  expect(val.value).toBe(15);
});

test("Join updates correctly", () => {
  let source1 = mutable(7);
  let source2 = mutable("boo");

  let val = join(source1, "fred", 56, true, source2);
  let observer = jest.fn();
  val.subscribe(observer);
  expect(val.value).toEqual([7, "fred", 56, true, "boo"]);

  source1.value = 87;
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual([87, "fred", 56, true, "boo"]);
  expect(observer.mock.calls[0][1]).toBe(val);
  observer.mockClear();
  expect(val.value).toEqual([87, "fred", 56, true, "boo"]);

  source2.value = "baz";
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual([87, "fred", 56, true, "baz"]);
  expect(observer.mock.calls[0][1]).toBe(val);
  observer.mockClear();
  expect(val.value).toEqual([87, "fred", 56, true, "baz"]);
});
