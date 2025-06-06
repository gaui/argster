import * as fs from 'fs';
import { globSync } from 'glob';

export default class FileUtils implements IFileUtils {
  private fsInstance: typeof fs;

  public constructor(fsInstance?: typeof fs) {
    this.fsInstance = fsInstance || fs;
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
      const newArgument: IArgumentFileContents = ({} as unknown) as IArgumentFileContents;
      newArgument.files = argument;
      newArgument.contents = argument.patterns
        .map((file: string) => this.readFileAsArray(file))
        .reduce((prev: string[], cur: string[]) => prev.concat(cur));
      newArray.push(newArgument);
    });

    return newArray;
  }

  public readFileAsArray(fileName: string): string[] {
    const content = this.fsInstance.readFileSync(fileName, {
      encoding: 'utf8'
    });
    const contentArray = content
      .split('\n')
      .map((x: string) => x.trim())
      .filter(Boolean);

    return contentArray;
  }

  public searchFilesForPatterns(patterns: string[], rootDir: string): string[] {
    const globOptions = {
      nodir: true,
      realpath: true,
      root: rootDir
    };

    let files: string[] = [];

    patterns.forEach(pattern => {
      const matches = globSync(pattern, globOptions);
      files = files.concat(matches);
    });

    return files;
  }
}
