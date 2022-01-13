import { mutable } from "./Mutable";
import { join, os } from "./operators";

test("Reactive updates correctly", () => {
  let source = mutable(6);

  let val = join((val) => val + 7, source);
  expect(val.value).toBe(13);

  source.value = 8;
  expect(val.value).toBe(15);
});

test("Reactive string updates", () => {
  let source = mutable("foo");

  let val = os`Test ${source} ${6} value`;

  expect(val.value).toBe("Test foo 6 value");

  source.value = "bar";
  expect(val.value).toBe("Test bar 6 value");
});
