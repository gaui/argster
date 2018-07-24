export interface IBuilder {
  options: IBuilderOptions;
  createCommand(filePatterns: IArgumentFiles[]): ICommand;
  getAllCommands(): ICommand[];
}

export interface IBuilderOptions {
  dynamicVariables?: IDynamicVariables;
}

export interface IArgumentFiles {
  prefix: string;
  patterns: string[];
}

export interface IArgumentFileContents {
  files: IArgumentFiles;
  contents: string[];
}

export interface ICommand {
  exec(): Promise<ICommandProcessOutput>;
  prependArgument(argument: string, prefix?: string): ICommandArgument;
  appendArgument(argument: string, prefix?: string): ICommandArgument;
  toString(): string;
}

export interface ICommandArgument {
  argumentBefore: string;
  argument: string;
  prefix?: string;
  toString(): string;
}

export interface ICommandOptions {
  filePatterns: IArgumentFiles[];
}

export interface IDynamicVariables {
  [key: string]: () => any;
}

export interface ICommandProcessOutput {
  stdout: string;
  stderr: string;
}
