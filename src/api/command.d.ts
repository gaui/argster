interface ICommand {
  /**
   * Executes a command
   * @param stdout Callback on STDOUT
   * @param stderr Callback on STDERR
   */
  exec(
    stdout?: (chunk: string) => void,
    stderr?: (chunk: string) => void
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

interface ICommandArgument {
  argument: string;
  prefix?: string;
}

interface ICommandOptions {
  filePatterns: IArgumentFilePatterns[];
}

interface ICommandProcess {
  command: string;
  promise: Promise<ICommandProcessOutput>;
}

interface ICommandProcessOutput {
  code: number;
  signal: string;
  stdout: string[];
  stderr: string[];
}

type TCommandArgumentInput =
  | ICommandArgument
  | ICommandArgument[]
  | string
  | string[];
