import R from 'ramda';
import { ITransformer, ITransformers } from './api/transformer';

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

const one = <V, T>(trans?: ITransformer<V, T>) => createTransformer(trans);

const multiple = <V, T>(trans: Array<ITransformer<V, T>>) =>
  R.pipe.call(null, ...trans.map(t => createTransformer<V, T>(t)));

const pattern = <V extends string, T>(
  regex: RegExp,
  trans?: ITransformer<V, T>
) => (val: V) =>
  val.replace(new RegExp(regex, 'gim'), createTransformer<V, any>(trans));

// Handling functions

const createTransformer = <V, T>(trans?: ITransformer<V, T>): ((val: V) => T) =>
  R.pipe(
    transformValue(getTransformer(trans)),
    getValue
  );

const getValue = <V>(val: V) => (val instanceof Function ? val() : val);
const getTransformer = <V, T>(trans?: ITransformer<V, T>): ITransformer<V, T> =>
  trans || transformers.default;

const transformValue = <V, T>(trans: ITransformer<V, T>) => (
  val: V
): Array<V | T> | (V | T) =>
  Array.isArray(val)
    ? val.map(transformSingle(trans))
    : transformSingle<V, T>(trans)(val);

const transformSingle = <V, T>(trans: ITransformer<V, T>) => (val: V): V | T =>
  trans.predicate(val) ? trans.replacer(val) : val;

export { transformers, one, multiple, pattern };
