import R from 'ramda';
import {
  ITransformer,
  ITransformers,
  ITransformerType
} from './api/transformer';

// Transformer is:
// - a function which takes in some value, checks if predicate matches
//   and runs replacer on it and returns the new value.
// - a function which takes in some value and a pattern, and runs replacer on
//   each match and returns the new value.

const transformers: ITransformers = {
  raw: {
    predicate: () => true,
    replacer: (val: string): string => val
  },
  sentencesInQuotes: {
    predicate: (val: string): boolean => {
      if (!val) return false;
      return val.split(' ').length > 1;
    },
    replacer: (val: string): string => `"${val}"`
  }
};

const one = <V, T>(trans?: ITransformer<V, T>): ITransformerType<V, T> =>
  createTransformer<V, T>(trans);

const multiple = <V, T>(trans: ITransformer<V, T>[]): ITransformerType<V, T> =>
  R.pipe.call(null, ...trans.map(t => createTransformer<V, T>(t)));

const pattern = <V extends string, T>(
  regex: RegExp,
  trans?: ITransformer<V, T>
): ((val: V) => string) => (val: V) =>
  val.replace(new RegExp(regex, 'gim'), createTransformer<V, any>(trans));

// Handling functions

function createTransformer<V, T>(
  trans?: ITransformer<V, T>
): ITransformerType<V, T> {
  return R.pipe(
    transformValue(getTransformer(trans)),
    getValue
  );
}

function getValue<V>(val: V): V | (() => V) {
  return val instanceof Function ? val() : val;
}

function getTransformer<V, T>(trans?: ITransformer<V, T>): ITransformer<V, T> {
  return trans || transformers.default;
}

function transformValue<V, T>(
  trans: ITransformer<V, T>
): (val: V) => V | T | (V | T)[] {
  return (val: V) =>
    Array.isArray(val)
      ? val.map(transformSingle(trans))
      : transformSingle<V, T>(trans)(val);
}

function transformSingle<V, T>(trans: ITransformer<V, T>): (val: V) => V | T {
  return (val: V): V | T => (trans.predicate(val) ? trans.replacer(val) : val);
}

export { transformers, one, multiple, pattern };
