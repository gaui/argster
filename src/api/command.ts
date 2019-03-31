import { IArgumentFilePatterns } from './options';

/* tslint:disable:no-empty-interface */

export interface ICommand {
  exec(
    stdout?: (chunk: string) => string,
    stderr?: (chunk: string) => string
  ): ICommandProcess;
  prependArgument(argument: TCommandArgumentInput): ICommand;
  appendArgument(argument: TCommandArgumentInput): ICommand;
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
  stdout: string[];
  stderr: string[];
}

export type TCommandArgumentInput =
  | ICommandArgument
  | ICommandArgument[]
  | string
  | string[];
