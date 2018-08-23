import { ICommand } from './command';
import { IArgumentFilePatterns, IDynamicVariables } from './misc';

/* tslint:disable:no-empty-interface */

export interface IBuilder {
  options: IBuilderOptions;
  /**
   * Create a new command and register it in the builder
   * @param command Main command, e.g. 'docker build'
   * @param filePatterns Command argument prefix and glob file patterns
   * @returns A new command object
   */
  createCommand(
    command: string,
    filePatterns?: IArgumentFilePatterns[]
  ): ICommand;

  /**
   * Get all commands that are registered in the builder
   * @returns Array of command objects
   */
  getAllCommands(): ICommand[];
}

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

  // Automatically put single quotes around sentences
  // default: true
  sentencesInQuotes?: boolean;

  // Pattern for matching variables
  // default: \$\{(.+)\}
  variablePattern?: RegExp;

  // Shell to use for executing commands
  // default: /bin/bash
  shell?: string;
}
