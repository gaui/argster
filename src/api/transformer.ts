export interface ITransform<V, T> {
  name?: string;
  predicate: (val: V) => boolean;
  replacer: (val: V) => T;
}

export interface ITransformer {
  append(transformers: Array<ITransform<any, any>>): void;
  all(subject: any): any;
  single(subject: any, transformerName: string): any;
  first(subject: any): any | undefined;
}
