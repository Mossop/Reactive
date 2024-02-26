import type {
  Observable,
  Observer,
  ObserverFn,
  ObserverObject,
  Unsubscribe,
} from "./types";

function upsert<K extends object, V>(
  map: Map<K, V> | WeakMap<K, V>,
  key: K,
  cb: () => V,
): V {
  if (map.has(key)) {
    return map.get(key)!;
  }

  let value = cb();
  map.set(key, value);
  return value;
}

class StrongRef {
  refCount: number = 0;

  refs = new Map<object, number>();

  addRef(obj: object): void {
    let count = upsert(this.refs, obj, () => 0);
    this.refs.set(obj, count + 1);
    this.refCount++;
  }

  release(obj: object): void {
    let count = this.refs.get(obj);
    if (count === undefined) {
      return;
    }

    if (count > 1) {
      this.refs.set(obj, count - 1);
    } else {
      this.refs.delete(obj);
    }

    this.refCount--;
  }
}

abstract class WrappedObserver<T> {
  protected constructor(protected readonly observable: Observable<T>) {}

  public abstract notify(value: T): void;

  public drop(): void {}

  public isAlive(): boolean {
    return true;
  }

  static wrap<T>(
    observable: Observable<T>,
    observer: Observer<T>,
  ): WrappedObserver<T> {
    if (typeof observer === "function") {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return new WrappedFn(observable, observer);
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new WrappedObject(observable, observer);
  }
}

class WrappedFn<T> extends WrappedObserver<T> {
  protected static refs = new StrongRef();

  public constructor(
    observable: Observable<T>,
    protected readonly observer: ObserverFn<T>,
  ) {
    super(observable);
    WrappedFn.refs.addRef(observable);
  }

  public notify(value: T): void {
    this.observer(value, this.observable);
  }

  public override drop(): void {
    WrappedFn.refs.release(this.observable);
  }
}

class WrappedObject<T> extends WrappedObserver<T> {
  protected static refs = new WeakMap<ObserverObject<any>, StrongRef>();

  protected observer: WeakRef<ObserverObject<T>>;

  public constructor(observable: Observable<T>, observer: ObserverObject<T>) {
    super(observable);

    this.observer = new WeakRef(observer);

    // As long as the observer is alive hold a strong reference to anything it observes.
    let refs = upsert(WrappedObject.refs, observer, () => new StrongRef());
    refs.addRef(observable);
  }

  public override isAlive(): boolean {
    return this.observer.deref() !== undefined;
  }

  public notify(value: T): void {
    this.observer.deref()?.observe(value, this.observable);
  }

  public override drop(): void {
    let observer = this.observer.deref();
    if (!observer) {
      return;
    }

    let refs = WrappedObject.refs.get(observer);
    if (!refs) {
      return;
    }

    refs.release(this.observable);
    if (refs.refCount == 0) {
      WrappedObject.refs.delete(observer);
    }
  }
}

export class Observers<T> {
  protected storage: Set<WrappedObserver<T>> = new Set();

  public constructor(protected readonly observable: Observable<T>) {}

  protected get observers(): WrappedObserver<T>[] {
    let observers: WrappedObserver<T>[] = [];

    for (let observer of this.storage) {
      if (observer.isAlive()) {
        observers.push(observer);
      } else {
        this.storage.delete(observer);
      }
    }

    return observers;
  }

  public subscribe(observer: Observer<T>): Unsubscribe {
    let wrapped = WrappedObserver.wrap(this.observable, observer);

    this.storage.add(wrapped);
    return () => {
      wrapped.drop();
      this.storage.delete(wrapped);
    };
  }

  public notify(value: T): void {
    for (let observer of this.observers) {
      observer.notify(value);
    }
  }
}
