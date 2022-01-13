import { Immutable, isObservable, Observable, ObservableValue, ObservedValue, valueOf } from "./Observable";
import { Mutable, Comparator } from "./Mutable";

const ObservableRegistry = new FinalizationRegistry(
  (cleanup: () => void): void => {
    cleanup();
  },
);

type ObservedValues<T> = T extends [infer I] ? [ObservedValue<I>] : T extends [infer S, ...(infer R)] ? [ObservedValue<S>, ...ObservedValues<R>] : T

export function join<T, O extends unknown[]>(
  cb: (...args: ObservedValues<O>) => T,
  ...params: O
): Observable<T> & ObservableValue<T> {
  let args = (): ObservedValues<O> => {
    // @ts-ignore
    return params.map(valueOf)
  };

  let inner = new Mutable(cb(...args()));

  let update = () => {
    inner.value = cb(...args());
  };

  let cleanups: (() => void)[] = [];
  for (let param of params) {
    if (isObservable(param)) {
      cleanups.push(param.observe(update));
    }
  }

  let immutable = new Immutable(inner);
  ObservableRegistry.register(immutable, () => {
    for (let cleanup of cleanups) {
      cleanup();
    }
  });

  return immutable as unknown as Observable<T> & ObservableValue<T>;
}

export function os(
  parts: TemplateStringsArray,
  ...params: unknown[]
): Observable<string> & string {
  let observables = params.filter(isObservable);
  return join((): string => {
    let result = "";
    let strings = [...parts];
    let vars = [...params];

    while (strings.length) {
      result += strings.shift();
      if (vars.length) {
        result += vars.shift();
      }
    }

    while (vars.length) {
      result += vars.shift();
    }

    return result;
  }, ...observables);
}
