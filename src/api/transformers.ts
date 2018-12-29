// tslint:disable interface-over-type-literal no-shadowed-variable

export interface ITransformer<V, T> {
  predicate: (val: V) => boolean;
  replacer: (val: V) => T;
}

export interface ITransformers {
  [key: string]: ITransformer<any, any>;
}
