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
  // default: \$\{(.+)\}
  variablePattern?: RegExp;

  // Shell to use for executing commands
  // default: /bin/bash
  shell?: string;

  // Transformers to run on each argument
  transformers?: string[];
}

export interface IDynamicVariables {
  [key: string]: any | (() => any);
}

export interface IArgumentFilePatterns {
  prefix: string;
  patterns: string[];
}
