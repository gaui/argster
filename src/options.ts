import { IBuilderOptions, TFeatureEvaluator } from './api/options';

export const defaultOptions: IBuilderOptions = {
  dynamicVariables: {},
  features: {
    sentencesInQuotes: true
  },
  rootDir: process.cwd(),
  shell: '/bin/bash',
  skipUnresolvedVariables: false,
  throwUnresolvedVariables: false,
  variablePattern: /\$\{(.+)\}/,
  warnUnresolvedVariables: true
};

const features: TFeatureEvaluator = {
  sentencesInQuotes: {
    predicate: (val: string): boolean => {
      if (!val) return false;
      return val.split(' ').length > 1;
    },
    replacer: (val: string): string => `"${val}"`
  }
};

export default features;
