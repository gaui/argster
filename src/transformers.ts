import { ITransformers } from './api/transformers';

const transformers: ITransformers = {
  sentencesInQuotes: {
    predicate: (val: string): boolean => {
      if (!val) return false;
      return val.split(' ').length > 1;
    },
    replacer: (val: string): string => `"${val}"`
  }
};

export default transformers;
