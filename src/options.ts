import { IBuilderOptions } from './api/options';

export const defaultOptions: IBuilderOptions = {
  dynamicVariables: {},
  rootDir: process.cwd(),
  shell: '/bin/bash',
  skipUnresolvedVariables: false,
  throwUnresolvedVariables: false,
  transformers: {
    sentencesInQuotes: true
  },
  variablePattern: /\$\{(.+)\}/,
  warnUnresolvedVariables: true
};
