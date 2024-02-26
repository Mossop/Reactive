import { isObservable } from "..";
import { Comparator, MaybeObservable, ObserverObject } from "../types";
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
  protected elementMap: Map<Element<S>, TE>;

  protected constructor(
    // @ts-ignore
    private readonly source: ObservableArrayBase<S>,
    storage: TE[],
  ) {
    super(storage);

    this.elementMap = new Map(
      storage.map((element: TE): [Element<S>, TE] => [element.source, element]),
    );
  }

  public abstract onSourceChanged(
    storage: readonly Element<S>[],
    changedElements?: Set<Element<S>>,
  ): void;
}

export class MappedArray<S, T> extends DerivedArray<S, T> {
  #mapper: (val: S) => T;

  #observer: ObserverObject<(val: S) => T> | null = null;

  public constructor(
    source: ObservableArrayBase<S>,
    sourceStorage: Element<S>[],
    protected readonly mapper: MaybeObservable<(val: S) => T>,
    protected readonly comparator: Comparator<T>,
  ) {
    super(
      source,
      sourceStorage.map(
        (element: Element<S>): DerivedElement<S, T> => ({
          source: element,
          value: (isObservable(mapper) ? mapper.value : mapper)(element.value),
        }),
      ),
    );

    if (isObservable(mapper)) {
      this.#mapper = mapper.value;

      let observe = (newMapper: (val: S) => T): void => {
        this.#mapper = newMapper;
        this.updateElements();
      };

      this.#observer = { observe };

      mapper.subscribe(this.#observer);
    } else {
      this.#mapper = mapper;
    }
  }

  private updateElements() {
    let changes = new Set<DerivedElement<S, T>>();
    for (let element of this.storage) {
      let newValue = this.#mapper(element.source.value);
      if (!this.comparator(newValue, element.value)) {
        element.value = newValue;
        changes.add(element);
      }
    }

    if (changes.size) {
      this.notifyChanges(changes);
    }
  }

  public override onSourceChanged(
    sourceStorage: readonly Element<S>[],
    changedElements?: Set<Element<S>>,
  ): void {
    let oldElements = this.storage.splice(0, this.storage.length);

    let oldSources = new Set(this.elementMap.keys());
    let changes = new Set<DerivedElement<S, T>>();
    let changed: boolean = false;

    sourceStorage.forEach((source, index) => {
      oldSources.delete(source);

      let element = this.elementMap.get(source);
      if (element) {
        if (element !== oldElements[index]) {
          changed = true;
        }

        if (changedElements?.has(source)) {
          let newValue = this.#mapper(source.value);
          if (!this.comparator(newValue, element.value)) {
            element.value = newValue;
            changes.add(element);
            changed = true;
          }
        }
      } else {
        element = {
          source,
          value: this.#mapper(source.value),
        };
        this.elementMap.set(source, element);
        changed = true;
      }

      this.storage.push(element);
    });

    for (let source of oldSources) {
      this.elementMap.delete(source);
    }

    if (changed) {
      this.notifyChanges(changes);
    }
  }
}
