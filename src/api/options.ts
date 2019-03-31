import { ITransformer } from './transformer';

export interface IBuilderOptions {
  // Root dir to resolve all paths from
  // default: process.cwd()
  rootDir?: string;

  // Key-Value map containing the name of the variable
  // and its value (function/lambda)
  dynamicVariables?: IDynamicVariables;

  // Skip command arguments where variables have "no value" *
  // default: false
  skipUnresolvedVariables?: boolean;

  // Warn on command arguments where variables have "no value" *
  // default: true
  warnUnresolvedVariables?: boolean;

  // Throw exception on command arguments where variables have "no value" *
  // default: false
  throwUnresolvedVariables?: boolean;

  // Pattern for matching variables
  // default: /\$\{(.+)\}/
  variablePattern?: RegExp;

  // Pattern for ignoring lines in variable files
  // default: /^(\#|\/{2,})/
  lineIgnorePattern?: RegExp;

  // Convert variables based on format. An example would be to convert
  // Windows environment variables to Linux, that is %FOO% -> $FOO
  // default: false
  convertVariables?: IConvertVariableOption;

  // Shell to use for executing commands
  // default: /bin/bash
  shell?: string;

  // Transformers to run on each argument
  transformers?: (ITransformer<string, string> | string)[];
}

export type IConvertVariableOption =
  | false
  | [
      true,
      {
        from: RegExp;
        to: string;
      }
    ];

export interface IDynamicVariables {
  [key: string]: unknown | (() => unknown);
}

export interface IArgumentFilePatterns {
  prefix: string;
  patterns: string[];
}
