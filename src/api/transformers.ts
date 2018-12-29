export interface ITransformer<V, T> {
  predicate: (val: V) => boolean;
  replacer: (val: V) => T;
}

export interface IBuiltInTransformers {
  // Automatically put single quotes around sentences
  // default: true
  sentencesInQuotes?: boolean;
}

export type TBuiltInTransformers = {
  [key in keyof IBuiltInTransformers]: ITransformer<any, any>
};

export interface ITransformers {
  [key: string]: ITransformer<any, any>;
}

export type IAvailableTransformers = IBuiltInTransformers | ITransformers;
