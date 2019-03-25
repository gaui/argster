import { IBuilderOptions } from './api/options';

// tslint:disable object-literal-sort-keys

export const defaultOptions: IBuilderOptions = {
  rootDir: process.cwd(),
  dynamicVariables: {},
  skipUnresolvedVariables: false,
  warnUnresolvedVariables: true,
  throwUnresolvedVariables: false,
  variablePattern: /\$\{(.+)\}/,
  lineIgnorePattern: /^(\#|\/{2,})/,
  convertVariables: false,
  shell: '/bin/bash',
  transformers: ['sentencesInQuotes']
};
