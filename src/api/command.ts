import { IArgumentFilePatterns } from './options';

export interface ICommand {
  /**
   * Executes a command
   * @param stdout Callback on STDOUT
   * @param stderr Callback on STDERR
   */
  exec(
    stdout?: (chunk: string) => string,
    stderr?: (chunk: string) => string
  ): ICommandProcess;

  /**
   * Prepend an argument
   * @param argument Argument
   */
  prependArgument(argument: TCommandArgumentInput): ICommand;

  /**
   * Append an argument
   * @param argument Argument
   */
  appendArgument(argument: TCommandArgumentInput): ICommand;

  /**
   * Get the command string
   */
  toString(): string;

  /**
   * Get the command string as an array
   */
  toArray(): readonly string[];
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
