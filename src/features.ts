import { TFeature } from './api/features';

const features: TFeature = {
  sentencesInQuotes: {
    predicate: (val: string): boolean => {
      return Boolean(val) && val.split(' ').length > 1;
    },
    replacer: (val: string): string => `"${val}"`
  }
};

export default features;
