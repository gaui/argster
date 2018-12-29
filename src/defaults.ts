import { IBuilderOptions } from './api/options';
import transformers from './transformers';

// tslint:disable object-literal-sort-keys

export const defaultOptions: IBuilderOptions = {
  rootDir: process.cwd(),
  dynamicVariables: {},
  skipUnresolvedVariables: false,
  warnUnresolvedVariables: true,
  throwUnresolvedVariables: false,
  variablePattern: /\$\{(.+)\}/,
  shell: '/bin/bash',
  transformers
};
