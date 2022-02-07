import { Comparator } from "../types";
// eslint-disable-next-line import/no-cycle
import { Element, ObservableArrayBase } from "./base";

interface DerivedElement<S, T> extends Element<T> {
  source: Element<S>;
}

export abstract class DerivedArray<
  S,
  T = S,
  TE extends DerivedElement<S, T> = DerivedElement<S, T>,
> extends ObservableArrayBase<T, TE> {
  protected elementMap: Map<Element<S>, number>;

  protected constructor(
    // @ts-ignore
    private readonly source: ObservableArrayBase<S>,
    storage: TE[],
  ) {
    super(storage);

    this.elementMap = new Map(
      storage.map((element: TE, index: number): [Element<S>, number] => [
        element.source,
        index,
      ]),
    );
  }

  protected elementFromSource(source: Element<S>): TE | undefined {
    let index = this.elementMap.get(source);
    if (index !== undefined) {
      return this.storage[index];
    }

    return undefined;
  }

  public abstract onSourceChanged(
    storage: readonly Element<S>[],
    changedElements?: Set<Element<S>>,
  ): void;
}

export class MappedArray<S, T> extends DerivedArray<S, T> {
  public constructor(
    source: ObservableArrayBase<S>,
    sourceStorage: Element<S>[],
    protected readonly mapper: (val: S) => T,
    protected readonly comparator: Comparator<T>,
  ) {
    super(
      source,
      sourceStorage.map(
        (element: Element<S>): DerivedElement<S, T> => ({
          source: element,
          value: mapper(element.value),
        }),
      ),
    );
  }

  public override onSourceChanged(
    sourceStorage: readonly Element<S>[],
    changedElements?: Set<Element<S>>,
  ): void {
    let storage: DerivedElement<S, T>[] = [];
    let changes = new Set<DerivedElement<S, T>>();
    let elementMap = new Map<Element<S>, number>();
    let changed: boolean = false;

    for (let source of sourceStorage) {
      elementMap.set(source, storage.length);
      if (!changed) {
        changed = this.elementMap.get(source) !== storage.length;
      }

      let element = this.elementFromSource(source);
      if (element) {
        if (changedElements?.has(source)) {
          let newValue = this.mapper(source.value);
          if (!this.comparator(newValue, element.value)) {
            element.value = this.mapper(source.value);
            changes.add(element);
            changed = true;
          }
        }

        storage.push(element);
      } else {
        storage.push({
          source,
          value: this.mapper(source.value),
        });
      }
    }

    if (changed) {
      this.storage = storage;
      this.elementMap = elementMap;

      this.notifyChanges(changes);
    }
  }
}
