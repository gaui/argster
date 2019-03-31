export interface ITransformers<V, T> {
  [key: string]: ITransformer<V, T>;
}

export interface ITransformer<V, T> {
  predicate: IPredicate<V>;
  replacer: IReplacer<V, T>;
}

export type ITransformerType<V, T> = (val?: V) => V | T;

export type IPredicate<V> = (val?: V) => boolean;
export type IReplacer<V, T> = ITransformerType<V, T>;
