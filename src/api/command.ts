import { IArgumentFilePatterns } from './options';

/* tslint:disable:no-empty-interface */

export interface ICommand {
  exec(
    stdout?: (chunk: any) => any,
    stderr?: (chunk: any) => any
  ): ICommandProcess;
  prependArgument(argument: CommandArgumentInput): void;
  appendArgument(argument: CommandArgumentInput): void;
  toString(): string;
  toArray(): ReadonlyArray<string>;
}

export interface ICommandArgument {
  argument: string;
  prefix?: string;
}

export interface ICommandOptions {
  filePatterns: IArgumentFilePatterns[];
}

export interface ICommandProcess {
  command: string;
  promise: Promise<ICommandProcessOutput>;
}

export interface ICommandProcessOutput {
  code: number;
  signal: string;
  stdout: any[];
  stderr: any[];
}

export interface ICommandEvalValueInput<V, T> {
  predicate: (val: V, injectedData?: any) => boolean;
  replacer: (val: V, injectedData?: any) => T;
}

export type CommandArgumentInput =
  | ICommandArgument
  | ICommandArgument[]
  | string
  | string[];
