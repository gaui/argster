import * as fs from 'fs';
import * as glob from 'glob';
import {
  CommandArgumentInput,
  IArgumentFileContents,
  IArgumentFilePatterns,
  IBuilderOptions,
  ICommandArgument,
  ICommandEvalValueInput
} from './api';
import { IBuilderUtils } from './api/utils/builder';
import { ICommandUtils } from './api/utils/command';
import { IFileUtils } from './api/utils/file';
import { IPredicate } from './api/utils/predicate';

/* tslint:disable:max-classes-per-file */

class BuilderUtils implements IBuilderUtils {
  public static readonly defaultOptions: IBuilderOptions = {
    dynamicVariables: {},
    features: {
      sentencesInQuotes: true
    },
    rootDir: process.cwd(),
    shell: '/bin/bash',
    skipUnresolvedVariables: false,
    variablePattern: /\$\{(.+)\}/,
    warnUnresolvedVariables: true
  };

  public parseOptions = (options?: IBuilderOptions): IBuilderOptions =>
    Object.assign(BuilderUtils.defaultOptions, options);
}

class FileUtils implements IFileUtils {
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
    const content = fs.readFileSync(fileName, { encoding: 'utf8' });
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

    return glob.sync(searchPattern, globOptions);
  }
}

class LogUtils {
  // tslint:disable-next-line:no-console
  public static warn = console.warn;
}

class CommandUtils implements ICommandUtils {
  public parseArgumentInput(args: CommandArgumentInput): ICommandArgument[] {
    const argArray: ICommandArgument[] | any = (Array.isArray(args)
      ? args
      : [args]
    )
      .map(
        (a: ICommandArgument): ICommandArgument | undefined => {
          return new Predicate([
            {
              predicate: val => typeof val === 'object',
              replacer: val => val
            },
            {
              predicate: val => typeof val === 'string',
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
    predicates?:
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

export { BuilderUtils, CommandUtils, FileUtils, LogUtils, Predicate };
