interface ITransformers<V, T> {
  [key: string]: ITransformer<V, T>;
}

interface ITransformer<V, T> {
  predicate: IPredicate<V>;
  replacer: IReplacer<V, T>;
}

type ITransformerType<V, T> = (val?: V) => V | T;

type IPredicate<V> = (val?: V) => boolean;
type IReplacer<V, T> = ITransformerType<V, T>;
