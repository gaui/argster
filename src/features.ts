import { TFeatureEvaluator } from './api/features';

const features: TFeatureEvaluator = {
  sentencesInQuotes: {
    predicate: (val: string): boolean => {
      return Boolean(val) && val.split(' ').length > 1;
    },
    replacer: (val: string): string => `"${val}"`
  }
};

export default features;
