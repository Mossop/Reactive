export type Observer<T> = (val: T, observer: Observable<T>) => void;
export type ObservedValue<T> = T extends Observable<infer I> ? I : T;

export type ObservableValue<T> = T extends number
  ? number
  : T extends string
  ? string
  : never;

export abstract class Observable<T> {
  public abstract readonly value: T;

  public valueOf() {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }

  public toJSON(): T {
    return this.value;
  }

  public abstract observe(observer: Observer<T>): () => void;
}

export const isObservable = (param: unknown): param is Observable<any> =>
  param instanceof Observable;

export class Immutable<T> extends Observable<T> {
  #inner: Observable<T>;

  public constructor(inner: Observable<T>) {
    super();
    this.#inner = inner;
  }

  public get value(): T {
    return this.#inner.value;
  }

  public observe(observer: Observer<T>): () => void {
    return this.#inner.observe((val) => observer(val, this));
  }
}

export function valueOf<T>(param: T): ObservedValue<T> {
  if (isObservable(param)) {
    return param.value;
  }

  // @ts-ignore
  return param;
}