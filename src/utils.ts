import * as fs from 'fs';
import * as glob from 'glob';
import {
  IArgumentFileContents,
  IArgumentFilePatterns,
  IBuilderOptions,
  ICommandArgument,
  ICommandEvalValueInput,
  TCommandArgumentInput
} from './api';
import { IUtils, IUtilsParam } from './api/utils';
import { IBuilderUtils } from './api/utils/builder';
import { ICommandUtils } from './api/utils/command';
import { IFileUtils } from './api/utils/file';
import { ILogUtils } from './api/utils/log';
import { IPredicate } from './api/utils/predicate';
import { defaultOptions } from './options';

/* tslint:disable:max-classes-per-file variable-name */

class BuilderUtils implements IBuilderUtils {
  public parseOptions = (options?: IBuilderOptions): IBuilderOptions =>
    Object.assign({}, defaultOptions, options);
}

class FileUtils implements IFileUtils {
  private __fs: any;
  private __glob: any;

  constructor(__fs?: any, __glob?: any) {
    this.__fs = __fs || fs;
    this.__glob = __glob || glob;
  }

  public computeFiles(
    argumentFilePatterns: IArgumentFilePatterns[],
    rootDir: string
  ): IArgumentFilePatterns[] {
    argumentFilePatterns.forEach(argument => {
      const search = this.searchFilesForPatterns(argument.patterns, rootDir);

      if (search.length) {
        argument.patterns = search;
      }
    });

    return argumentFilePatterns;
  }

  public computeFileContents(
    argumentFilePatterns: IArgumentFilePatterns[]
  ): IArgumentFileContents[] {
    const newArray = [] as IArgumentFileContents[];
    argumentFilePatterns.forEach((argument: IArgumentFilePatterns) => {
      const newArgument = {} as IArgumentFileContents;
      newArgument.files = argument;
      newArgument.contents = argument.patterns
        .map((file: string) => this.readFileAsArray(file))
        .reduce((prev: string[], cur: string[]) => prev.concat(cur));
      newArray.push(newArgument);
    });

    return newArray;
  }

  public readFileAsArray(fileName: string): string[] {
    const content = this.__fs.readFileSync(fileName, { encoding: 'utf8' });
    const contentArray = content.split('\n').filter(Boolean);

    return contentArray;
  }

  public searchFilesForPatterns(patterns: string[], rootDir: string): string[] {
    const searchPattern = patterns.join('|');
    const globOptions = {
      cwd: rootDir,
      nodir: true,
      realpath: true,
      root: rootDir
    };

    return this.__glob.sync(searchPattern, globOptions);
  }
}

class LogUtils implements ILogUtils {
  // tslint:disable-next-line:no-console
  public warn = console.warn;
}

class CommandUtils implements ICommandUtils {
  public parseArgumentInput(args: TCommandArgumentInput): ICommandArgument[] {
    const argArray: ICommandArgument[] | any = (Array.isArray(args)
      ? args
      : [args]
    )
      .map(
        (a: ICommandArgument): ICommandArgument | undefined => {
          return new Predicate([
            {
              predicate: (val: any) => typeof val === 'object',
              replacer: (val: any) => val
            },
            {
              predicate: (val: any) => typeof val === 'string',
              replacer: (val: string) => ({ argument: val })
            }
          ]).first(a);
        }
      )
      .filter(Boolean);

    return argArray || [];
  }
}

class Predicate implements IPredicate {
  private predicates: Array<ICommandEvalValueInput<any, any>>;
  constructor(
    predicates:
      | Array<ICommandEvalValueInput<any, any>>
      | ICommandEvalValueInput<any, any>
  ) {
    if (!predicates) return;

    if (!Array.isArray(predicates)) {
      predicates = [predicates];
    }

    this.predicates = predicates;
  }

  public first(value: any): any | undefined {
    if (!value) return;

    const obj = this.predicates.find(x => x.predicate(value));

    if (!obj) return;

    return obj.replacer(value);
  }

  public all(value: any): any | undefined {
    if (!value) return;

    let newValue: any = value;

    this.predicates.forEach(({ predicate, replacer }) => {
      if (predicate && replacer && predicate(value)) {
        newValue = replacer(newValue);
      }
    });

    return newValue;
  }
}

const utilFactory = (utils?: IUtilsParam): IUtils => ({
  builder: (utils && utils.builder) || new BuilderUtils(),
  command: (utils && utils.command) || new CommandUtils(),
  file: (utils && utils.file) || new FileUtils(),
  log: (utils && utils.log) || new LogUtils()
});

export {
  utilFactory,
  BuilderUtils,
  CommandUtils,
  FileUtils,
  LogUtils,
  Predicate
};
