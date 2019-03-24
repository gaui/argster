export interface ITransformers {
  [key: string]: ITransformer<any, any>;
}

export interface ITransformer<V, T> {
  predicate: IPredicate<V>;
  replacer: IReplacer<V, T>;
}

export type IPredicate<V> = (val: V) => boolean;
export type IReplacer<V, T> = (val: V) => T | V;
