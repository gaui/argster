import { exec } from 'child_process';
import {
  IArgumentFileContents,
  IArgumentFilePatterns,
  IBuilderOptions,
  ICommand,
  ICommandArgument,
  ICommandEvalValueInput,
  ICommandProcess,
  ICommandProcessOutput
} from './api';
import { VariableUnresolvableException } from './exceptions';
import features from './features';
import { CommandUtils, FileUtils, LogUtils, Predicate } from './utils';

/* tslint:disable:no-console */
const stdoutLog = (str: string) => process.stdout.write(str);
const stderrLog = (str: string) => process.stderr.write(str);

class Command implements ICommand {
  public files: IArgumentFilePatterns[] = [];
  public command: string;
  public arguments: ICommandArgument[] = [];
  private builderOptions: IBuilderOptions;

  constructor(
    builderOptions: IBuilderOptions,
    command: string,
    filePatterns?: IArgumentFilePatterns[]
  ) {
    this.command = command;
    this.builderOptions = builderOptions;

    if (filePatterns) {
      this.files = FileUtils.computeFiles(
        filePatterns,
        builderOptions.rootDir as string
      );
      const contents = FileUtils.computeFileContents(this.files);
      this.arguments = this.computeArguments(contents);
    }
  }

  public exec(): ICommandProcess {
    const cmd = exec(this.toString(), { shell: this.builderOptions.shell });
    const promise = new Promise<ICommandProcessOutput>((resolve, reject) => {
      const successFn = (code: number, signal: string) => {
        const output = { code, signal } as ICommandProcessOutput;

        if (code === 0) {
          resolve(output);
        } else {
          reject(output);
        }
      };

      cmd.on('exit', successFn);
      cmd.on('close', successFn);
      cmd.on('error', (err: any) => reject(err));
    });

    cmd.stdout.on('data', stdoutLog);
    cmd.stderr.on('data', stderrLog);

    const commandProcess: ICommandProcess = {
      command: this.toString(),
      promise
    };

    return commandProcess;
  }

  public prependArgument(argument: ICommandArgument): void {
    this.argumentHelper(argument, (arg: ICommandArgument) => {
      this.arguments.unshift(arg);
    });
  }

  public appendArgument(argument: ICommandArgument): void {
    this.argumentHelper(argument, (arg: ICommandArgument) => {
      this.arguments.push(arg);
    });
  }

  public toArray(): ReadonlyArray<string> {
    const initArray: any = ([[]] as any).concat(this.arguments);
    const argArray = initArray
      .map((arg: ICommandArgument) => [arg.prefix, arg.argument])
      .reduce((prev: ICommandArgument[], cur: ICommandArgument[]) =>
        prev.concat(cur)
      )
      .filter(Boolean) as ReadonlyArray<string>;

    return argArray;
  }

  public toString(): string {
    const argString = this.arguments
      .map((arg: ICommandArgument) => arg.toString())
      .join('')
      .trim();

    return `${this.command}${argString ? ' ' + argString : ''}`;
  }

  private createArgument(
    argument: string,
    prefix?: string
  ): ICommandArgument | null {
    const newObj = new CommandArgument(this.builderOptions, argument, prefix);

    if (Object.keys(newObj).length) return newObj;

    return null;
  }

  private computeArguments(
    contents: IArgumentFileContents[]
  ): ICommandArgument[] {
    const commands: ICommandArgument[] = [];
    for (const arg of contents) {
      arg.contents.forEach((line: string) => {
        const argument = this.createArgument(line, arg.files.prefix);

        if (argument) {
          commands.push(argument);
        }
      });
    }

    return commands;
  }

  private argumentHelper(
    argument: ICommandArgument,
    callback: (arg: ICommandArgument) => void
  ): void {
    CommandUtils.parseArgumentInput(argument).forEach(a => {
      const arg = this.createArgument(a.argument, a.prefix);
      if (arg) {
        callback(arg);
      }
    });
  }
}

class CommandArgument implements ICommandArgument {
  public argument: string;
  public prefix?: string;

  constructor(
    builderOptions: IBuilderOptions,
    argument: string,
    prefix?: string
  ) {
    let newArgument = argument;
    if ((builderOptions.variablePattern as RegExp).test(argument)) {
      try {
        newArgument =
          this.resolveDynamicVariable(builderOptions, argument) || '';
      } catch (obj) {
        if (builderOptions.warnUnresolvedVariables) {
          LogUtils.warn(obj.toString());
          // TODO: Log err.stack
        }

        if (builderOptions.skipUnresolvedVariables) return;
      }
    }

    this.prefix = prefix ? prefix.trim() : undefined;
    this.argument = newArgument ? newArgument.trim() : '';
  }

  public toString() {
    const prefix = this.prefix ? this.prefix + ' ' : '';
    return `${prefix}${this.argument} `;
  }

  private resolveDynamicVariable(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined | null {
    if (!argument || !builderOptions.dynamicVariables) return;

    const extractFn: Array<ICommandEvalValueInput<any, string>> = [
      {
        predicate: (val: () => string) => val instanceof Function,
        replacer: (val: () => string) => val()
      },
      {
        predicate: (val: string) => typeof val === 'string',
        replacer: (val: string) => val
      }
    ];

    const featuresActive = Object.keys(features)
      .filter(x => builderOptions[x])
      .map(x => features[x]);
    const featurePredicate = new Predicate(featuresActive);

    const dynVariables = builderOptions.dynamicVariables;
    const dynPredicate = new Predicate(extractFn);
    const dynVarPattern = builderOptions.variablePattern as RegExp;

    let unresolved: VariableUnresolvableException | undefined;
    const arg = argument.replace(
      new RegExp(dynVarPattern, 'gim'),
      (match: any, actualValue: any): string => {
        let resolvedValue = actualValue;
        resolvedValue = dynPredicate.first(dynVariables[actualValue]);
        resolvedValue = featurePredicate.all(resolvedValue);

        if (!resolvedValue) {
          unresolved = new VariableUnresolvableException({
            argument,
            original: match,
            variable: actualValue
          });
          return '';
        }

        return resolvedValue;
      }
    );

    if (unresolved) {
      throw unresolved;
    }

    return arg.trim();
  }
}

export { Command, CommandArgument };
