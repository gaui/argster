import { exec } from 'child_process';
import * as util from 'util';
import {
  IArgumentFileContents,
  IArgumentFiles,
  IBuilderOptions,
  ICommand,
  ICommandArgument,
  ICommandProcessOutput,
  IDynamicVariables
} from './interfaces';
import { FileUtil } from './utils';

const execAsync = util.promisify(exec);

class Command implements ICommand {
  public files: IArgumentFiles[];
  public arguments: ICommandArgument[];
  private builderOptions: IBuilderOptions;

  constructor(filePatterns: IArgumentFiles[], builderOptions: IBuilderOptions) {
    this.builderOptions = builderOptions;
    this.files = FileUtil.computeFiles(filePatterns);
    const contents = FileUtil.computeFileContents(this.files);
    this.arguments = this.computeArguments(contents);
  }

  public exec(): Promise<ICommandProcessOutput> {
    return execAsync(this.toString());
  }

  public prependArgument(argument: string, prefix?: string): ICommandArgument {
    const arg = this.createArgument(argument, prefix);
    this.arguments.unshift(arg);
    return arg;
  }

  public appendArgument(argument: string, prefix?: string): ICommandArgument {
    const arg = this.createArgument(argument, prefix);
    this.arguments.push(arg);
    return arg;
  }

  public toString(): string {
    return this.arguments
      .map((arg: ICommandArgument) => arg.toString())
      .join('')
      .trim();
  }

  private createArgument(argument: string, prefix?: string): ICommandArgument {
    return new CommandArgument(this.builderOptions, argument, prefix);
  }

  private computeArguments(
    contents: IArgumentFileContents[]
  ): ICommandArgument[] {
    const commands: ICommandArgument[] = [];
    for (const arg of contents) {
      arg.contents.forEach((line: string) => {
        const argument = this.createArgument(line, arg.files.prefix);
        commands.push(argument);
      });
    }

    return commands;
  }
}

class CommandArgument implements ICommandArgument {
  public argumentBefore: string;
  public argument: string;
  public prefix?: string;

  constructor(
    builderOptions: IBuilderOptions,
    argument: string,
    prefix?: string
  ) {
    if (prefix) {
      this.prefix = prefix;
    }
    this.argumentBefore = argument;
    this.argument = this.evalDynamicVariable(
      argument,
      builderOptions.dynamicVariables
    );
  }

  public toString() {
    const prefix = this.prefix ? this.prefix + ' ' : '';
    return `${prefix}${this.argument} `;
  }

  private evalDynamicVariable(
    argument: string,
    dynamicVariables?: IDynamicVariables
  ): string {
    const dynVars = dynamicVariables || {};
    let arg;
    arg = argument.replace(/\$\{(.+)\}/gim, replaceFn);

    function replaceFn(m: any, p1: any) {
      if (!dynVars || !(dynVars[p1] instanceof Function)) {
        return m;
      }

      return dynVars[p1]();
    }

    return arg || '';
  }
}

export default Command;
