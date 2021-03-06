import { mutable, os } from "../src";

test("Reactive string updates", () => {
  let source = mutable("foo");

  let val = os`Test ${source} ${6} value`;
  let observer = jest.fn();
  val.subscribe(observer);

  expect(val.value).toBe("Test foo 6 value");

  source.value = "bar";
  expect(observer).toHaveBeenCalledTimes(1);
  expect(observer.mock.calls[0][0]).toEqual("Test bar 6 value");
  expect(observer.mock.calls[0][1]).toBe(val);
  observer.mockClear();
  expect(val.value).toBe("Test bar 6 value");
});

// test("Resolved values", async () => {
//   let sourcePromise = Promise.resolve(5);
//   let source = mutable(sourcePromise);

//   let val = resolve(source);
//   let observer = jest.fn();
//   subscribe(val, observer);
//   expect(val.value).toBe(undefined);

//   await sourcePromise;
//   expect(observer).toHaveBeenCalledTimes(1);
//   expect(observer.mock.calls[0][0]).toBe(5);
//   expect(observer.mock.calls[0][1]).toBe(val);
//   observer.mockClear();
//   expect(val.value).toBe(5);

//   let resolver: (val: number) => void;
//   sourcePromise = new Promise<number>((rslv) => {
//     resolver = rslv;
//   });
//   source.value = sourcePromise;

//   expect(observer).toHaveBeenCalledTimes(0);
//   expect(val.value).toBe(5);

//   resolver!(28);

//   await sourcePromise;
//   expect(observer).toHaveBeenCalledTimes(1);
//   expect(observer.mock.calls[0][0]).toBe(28);
//   expect(observer.mock.calls[0][1]).toBe(val);
//   observer.mockClear();
//   expect(val.value).toBe(28);

//   sourcePromise = new Promise<number>((rslv) => {
//     resolver = rslv;
//   });
//   source.value = sourcePromise;

//   let resolver2: (val: number) => void;
//   let sourcePromise2 = new Promise<number>((rslv) => {
//     resolver2 = rslv;
//   });
//   source.value = sourcePromise2;

//   expect(observer).toHaveBeenCalledTimes(0);
//   expect(val.value).toBe(28);

//   resolver!(823);
//   resolver2!(726);

//   await sourcePromise;
//   await sourcePromise2;

//   expect(observer).toHaveBeenCalledTimes(2);
//   expect(observer.mock.calls[0][0]).toBe(823);
//   expect(observer.mock.calls[0][1]).toBe(val);
//   expect(observer.mock.calls[1][0]).toBe(726);
//   expect(observer.mock.calls[1][1]).toBe(val);
//   observer.mockClear();
//   expect(val.value).toBe(726);

//   sourcePromise = new Promise<number>((rslv) => {
//     resolver = rslv;
//   });
//   source.value = sourcePromise;

//   sourcePromise2 = new Promise<number>((rslv) => {
//     resolver2 = rslv;
//   });
//   source.value = sourcePromise2;

//   expect(observer).toHaveBeenCalledTimes(0);
//   expect(val.value).toBe(726);

//   resolver2!(34);
//   await sourcePromise2;

//   expect(observer).toHaveBeenCalledTimes(1);
//   expect(observer.mock.calls[0][0]).toBe(34);
//   expect(observer.mock.calls[0][1]).toBe(val);
//   observer.mockClear();
//   expect(val.value).toBe(34);

//   resolver!(89);

//   await sourcePromise;

//   expect(observer).toHaveBeenCalledTimes(0);
//   expect(val.value).toBe(34);
// });
