import R from 'ramda';
import { ITransformer, ITransformerType } from './api/transformer';

// Transformer is:
// - a function which takes in some value, checks if predicate matches
//   and runs replacer on it and returns the new value.
// - a function which takes in some value and a pattern, and runs replacer on
//   each match and returns the new value.

const transformers: { [key: string]: ITransformer<string, string> } = {
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

const one = <V, T>(trans: ITransformer<V, T>): ITransformerType<V, T> =>
  createTransformer<V, T>(trans);

const multiple = <V, T>(trans: ITransformer<V, T>[]): ITransformerType<V, T> =>
  R.pipe.call(null, ...trans.map(t => createTransformer<V, T>(t)));

const pattern = <V, T>(
  regex: RegExp,
  trans: ITransformer<V, T>
): ITransformerType<V, string> => (val: V): string => {
  return ((val as unknown) as string).replace(
    new RegExp(regex, 'gim'),
    (createTransformer<V, T>(trans) as unknown) as () => string
  );
};

// Handling functions

function createTransformer<V, T>(
  trans: ITransformer<V, T>
): ITransformerType<V, T> {
  const transformer = getTransformer(trans);
  const transformedValue = transformValue(transformer);
  return R.pipe(
    transformedValue,
    getValue
  );
}

function getValue<V>(val: V): V {
  return val instanceof Function ? val() : val;
}

function getTransformer<V, T>(trans: ITransformer<V, T>): ITransformer<V, T> {
  return trans || transformers.raw;
}

function transformValue<V, T>(
  trans: ITransformer<V, T>
): ITransformerType<V, T> {
  return (val: V) =>
    Array.isArray(val)
      ? val.reduce(transformSingle(trans))
      : transformSingle<V, T>(trans)(val);
}

function transformSingle<V, T>(
  trans: ITransformer<V, T>
): ITransformerType<V, T> {
  return (val: V) => (trans.predicate(val) ? trans.replacer(val) : val);
}

export { transformers, one, multiple, pattern };
