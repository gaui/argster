import { exec, ChildProcess } from 'child_process';
import CommandArgument from './commandArgument';
import utilFactory from './utils/factory';

class Command implements ICommand {
  public files: IArgumentFilePatterns[] = [];
  public command: string;
  public arguments: ICommandArgument[] = [];
  private builderOptions: IBuilderOptions;

  private utils: IUtils;

  public constructor(
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
    stdout?: (chunk: string) => void,
    stderr?: (chunk: string) => void
  ): ICommandProcess {
    const cmd = exec(this.toString(), { shell: this.builderOptions.shell });

    const stdoutArray = this.createStdStream(cmd, 'stdout', stdout);
    const stderrArray = this.createStdStream(cmd, 'stderr', stderr);

    const promise: Promise<ICommandProcessOutput> = new Promise<
      ICommandProcessOutput
    >((resolve, reject): void => {
      const successFn = (code: number, signal: string): void => {
        const output: ICommandProcessOutput = {
          code,
          signal,
          stderr: stderrArray,
          stdout: stdoutArray
        };

        if (code === 0) {
          resolve(output);
        } else {
          reject(output);
        }
      };

      const errorFn = (err: string): void => reject(err);

      cmd.on('close', successFn);
      cmd.on('error', errorFn);
    });

    const commandProcess: ICommandProcess = {
      command: this.toString(),
      promise
    };

    return commandProcess;
  }

  public prependArgument(argument: ICommandArgument): ICommand {
    this.argumentHelper(argument, (arg: ICommandArgument): void => {
      this.arguments.unshift(arg);
    });

    return this;
  }

  public appendArgument(argument: ICommandArgument): ICommand {
    this.argumentHelper(argument, (arg: ICommandArgument): void => {
      this.arguments.push(arg);
    });

    return this;
  }

  public toArray(): readonly string[] {
    const argArray = [...this.arguments]
      .reduce(
        (prev, cur): (string | undefined)[] =>
          prev.concat(cur.prefix, cur.argument),
        [] as (string | undefined)[]
      )
      .filter(Boolean) as readonly string[];

    return [this.command].concat(argArray);
  }

  public toString(): string {
    const argString = [this.command.concat(' '), ...this.arguments]
      .map((arg: ICommandArgument): string => arg.toString())
      .join('')
      .trim();

    return argString;
  }

  private createArgument(
    argument: string,
    prefix?: string
  ): ICommandArgument | null {
    try {
      const newObj = new CommandArgument(
        this.builderOptions,
        argument,
        prefix,
        this.utils
      );

      if (Object.keys(newObj).length) return newObj;
    } catch (e) {
      if (this.builderOptions.throwUnresolvedVariables) {
        throw e;
      }
    }

    return null;
  }

  private computeArguments(
    contents: IArgumentFileContents[]
  ): ICommandArgument[] {
    const commands: ICommandArgument[] = [];
    for (const arg of contents) {
      arg.contents.forEach((line: string) => {
        if (
          this.builderOptions.lineIgnorePattern &&
          this.builderOptions.lineIgnorePattern.test(line)
        ) {
          return;
        }

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

  private createStdStream(
    cmd: ChildProcess,
    type: 'stdout' | 'stderr',
    callback?: (chunk: string) => void
  ): string[] {
    const array: string[] = [];

    const command = cmd[type];
    if (command) {
      command.on('data', chunk => {
        const stringChunk = chunk.toString();
        if (callback) {
          callback(stringChunk);
        }

        array.push(stringChunk);
      });
    }

    return array;
  }
}

export default Command;
