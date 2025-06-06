import fs from 'fs';
import glob from 'glob';
import { IFileUtils, IArgumentFilePatterns } from '../types';

export default class FileUtils implements IFileUtils {
  private fsInstance = fs;
  private globInstance = glob;

  public searchAndReadFiles(
    argumentFilePatterns: IArgumentFilePatterns[],
    rootDir: string
  ): IArgumentFilePatterns[] {
    argumentFilePatterns.forEach((argument) => {
      const search = this.searchFilesForPatterns(argument.patterns, rootDir);

      if (search.length) {
        argument.files = this.computeFileContents(search);
      }
    });

    return argumentFilePatterns;
  }

  public readFileAsArray(fileName: string): string[] {
    const content = this.fsInstance.readFileSync(fileName, {
      encoding: 'utf8',
    });
    const contentArray = content
      .split('\n')
      .map((x: string) => x.trim())
      .filter(Boolean);

    return contentArray;
  }

  public searchFilesForPatterns(patterns: string[], rootDir: string): string[] {
    const globOptions = {
      cwd: rootDir,
      nodir: true,
      realpath: true,
      root: rootDir,
    };

    const results = patterns
      .map((pattern) => this.globInstance.sync(pattern, globOptions))
      .reduce<string[]>((prev, cur) => prev.concat(cur), []);

    return results;
  }
}
