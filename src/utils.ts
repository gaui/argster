import * as fs from 'fs';
import * as glob from 'glob';
import {
  IArgumentFileContents,
  IArgumentFiles,
  IBuilderOptions
} from './interfaces';

class BuilderUtils {
  public static get defaultOptions(): IBuilderOptions {
    return {
      dynamicVariables: {}
    };
  }

  public static parseOptions(options?: IBuilderOptions): IBuilderOptions {
    const opts = Object.assign(BuilderUtils.defaultOptions, options);

    return opts;
  }
}

class FileUtil {
  public static computeFiles(
    argumentFilePatterns: IArgumentFiles[]
  ): IArgumentFiles[] {
    argumentFilePatterns.forEach(argument => {
      argument.patterns = this.searchFilesForPatterns(argument.patterns);
    });

    return argumentFilePatterns;
  }

  public static computeFileContents(
    argumentFilePatterns: IArgumentFiles[]
  ): IArgumentFileContents[] {
    const newArray = [] as IArgumentFileContents[];
    argumentFilePatterns.forEach((argument: IArgumentFiles) => {
      const newArgument = {} as IArgumentFileContents;
      newArgument.files = argument;
      newArgument.contents = argument.patterns
        .map((file: string) => this.readFileAsArray(file))
        .reduce((prev: string[], cur: string[]) => prev.concat(cur));
      newArray.push(newArgument);
    });

    return newArray;
  }

  public static readFileAsArray(fileName: string): string[] {
    const content = fs.readFileSync(fileName, { encoding: 'utf8' });
    const contentArray = content.split('\n').filter(Boolean);

    return contentArray;
  }

  public static searchFilesForPatterns(patterns: string[]): string[] {
    const searchPattern = patterns.join('|');
    const globOptions = { matchBase: true, nodir: true };

    return glob.sync(searchPattern, globOptions);
  }
}

export { BuilderUtils, FileUtil };
