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

const transformers: ITransformers<string, string> = {
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

const one = <V, T>(
  trans?: ITransformer<string, string>
): ITransformerType<string, string> => createTransformer<string, string>(trans);

const multiple = <V, T>(
  trans: ITransformer<string, string>[]
): ITransformerType<V, T> =>
  R.pipe.call(null, ...trans.map(t => createTransformer<string, string>(t)));

const pattern = <V, T>(
  regex: RegExp,
  trans?: ITransformer<string, string>
): ((val: string) => string) => (val: string): string => {
  const value = (val as unknown) as string;
  return value.replace(new RegExp(regex, 'gim'), (createTransformer<
    string,
    string
  >(trans) as unknown) as ((substring: string, ...args: unknown[]) => string));
};

// Handling functions

function createTransformer<V, T>(
  trans?: ITransformer<string, string>
): ITransformerType<string, string> {
  return R.pipe(
    transformValue(getTransformer(trans)),
    getValue
  );
}

function getValue<V>(val: V): V | (() => V) {
  return val instanceof Function ? val() : val;
}

function getTransformer<V, T>(
  trans?: ITransformer<string, string>
): ITransformer<string, string> {
  return trans || transformers.default;
}

function transformValue<V, T>(
  trans: ITransformer<string, string>
): (val: string) => string | string | (string | string)[] {
  return (val: string) =>
    Array.isArray(val)
      ? val.map(transformSingle(trans))
      : transformSingle<V, T>(trans)(val);
}

function transformSingle<V, T>(
  trans: ITransformer<string, string>
): (val: string) => string | string {
  return (val: string): string | string =>
    trans.predicate(val) ? trans.replacer(val) : val;
}

export { transformers, one, multiple, pattern };
