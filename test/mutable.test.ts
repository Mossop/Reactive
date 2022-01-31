import { mutable } from "../src/Mutable";
import { subscribe } from "../src/subscribe";

test("Value changes correctly", () => {
  let val = mutable(5);
  expect(val.value).toBe(5);

  val.value = 27;
  expect(val.value).toBe(27);

  let observer = jest.fn();
  let cancel = subscribe(val, observer);

  val.value = 6;
  expect(observer.mock.calls[0][0]).toBe(6);
  expect(observer.mock.calls[0][1]).toBe(val);
  observer.mockClear();

  val.value = 8;
  expect(observer.mock.calls[0][0]).toBe(8);
  expect(observer.mock.calls[0][1]).toBe(val);
  observer.mockClear();

  cancel();

  val.value = 3;
  expect(observer.mock.calls.length).toBe(0);
});
