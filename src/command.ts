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
import { IUtils } from './api/utils';
import { IPredicate } from './api/utils/predicate';
import { VariableUnresolvableException } from './exceptions';
import features from './options';
import { Predicate, utilFactory } from './utils';

class Command implements ICommand {
  public files: IArgumentFilePatterns[] = [];
  public command: string;
  public arguments: ICommandArgument[] = [];
  private builderOptions: IBuilderOptions;

  private utils: IUtils;

  constructor(
    builderOptions: IBuilderOptions,
    command: string,
    filePatterns?: IArgumentFilePatterns[],
    utils?: IUtils
  ) {
    this.utils = utils || utilFactory();
    this.command = command;
    this.builderOptions = builderOptions;

    if (filePatterns) {
      this.files = this.utils.file.computeFiles(
        filePatterns,
        builderOptions.rootDir as string
      );
      const contents = this.utils.file.computeFileContents(this.files);
      this.arguments = this.computeArguments(contents);
    }
  }

  public exec(
    stdout?: (chunk: any) => void,
    stderr?: (chunk: any) => void
  ): ICommandProcess {
    const cmd = exec(this.toString(), { shell: this.builderOptions.shell });
    const stdoutArray: any[] = [];
    const stderrArray: any[] = [];

    const promise = new Promise<ICommandProcessOutput>((resolve, reject) => {
      const successFn = (code: number, signal: string) => {
        const output = {
          code,
          signal,
          stderr: stderrArray,
          stdout: stdoutArray
        } as ICommandProcessOutput;

        if (code === 0) {
          resolve(output);
        } else {
          reject(output);
        }
      };

      cmd.on('close', successFn);
      cmd.on('error', (err: any) => reject(err));
    });

    cmd.stdout.on('data', chunk => {
      if (stdout) {
        stdout(chunk);
      }

      stdoutArray.push(chunk);
    });

    cmd.stderr.on('data', chunk => {
      if (stderr) {
        stderr(chunk);
      }

      stderrArray.push(chunk);
    });

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
    const newObj = new CommandArgument(
      this.builderOptions,
      argument,
      prefix,
      this.utils
    );

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
    this.utils.command.parseArgumentInput(argument).forEach(a => {
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

  private utils: IUtils;

  constructor(
    builderOptions: IBuilderOptions,
    argument: string,
    prefix?: string,
    utils?: IUtils
  ) {
    this.utils = utils || utilFactory();

    const newArgument = this.reducer(builderOptions, argument);

    this.prefix = prefix ? prefix.trim() : undefined;
    this.argument = newArgument ? newArgument.trim() : '';
  }

  public toString() {
    const prefix = this.prefix ? this.prefix + ' ' : '';
    return `${prefix}${this.argument} `;
  }

  private reducer(builderOptions: IBuilderOptions, argument: string): string {
    const fns = [
      this.resolveDynamicVariable.bind(this),
      this.applyFeatures.bind(this)
    ];
    const newArgument = fns.reduce(
      (acc, fn) => fn(builderOptions, acc) || '',
      argument
    );

    return newArgument;
  }

  private applyFeatures(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined {
    if (!builderOptions.features) return;

    const featuresActive = Object.keys(features)
      .filter(x => builderOptions.features![x])
      .map(
        x =>
          ({
            predicate: features[x].predicate,
            replacer: features[x].replacer
          } as ICommandEvalValueInput<string, string>)
      );

    const featurePredicate: IPredicate = new Predicate(featuresActive);
    const resolvedValue = featurePredicate.all(argument);

    return resolvedValue;
  }

  private resolveDynamicVariable(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined {
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

    const dynVariables = builderOptions.dynamicVariables;
    const dynPredicate: IPredicate = new Predicate(extractFn);
    const dynVarPattern = builderOptions.variablePattern;

    const replacerFn = (match: any, actualValue: any): string => {
      const resolvedValue = dynPredicate.first(dynVariables[actualValue]);
      if (!resolvedValue) {
        const unresolved = new VariableUnresolvableException({
          argument,
          original: match,
          variable: actualValue
        });

        if (builderOptions.warnUnresolvedVariables) {
          this.utils.log.warn(unresolved.toString());
        }

        if (builderOptions.skipUnresolvedVariables) return '';

        if (builderOptions.throwUnresolvedVariables) throw unresolved;
      }

      return resolvedValue || '';
    };

    try {
      const arg = argument.replace(
        new RegExp(dynVarPattern!, 'gim'),
        replacerFn
      );

      return arg.trim();
    } catch (e) {
      // TODO: Logging
      throw e;
    }
  }
}

export { Command, CommandArgument };
