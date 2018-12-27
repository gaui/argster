import { IArgumentFileContents, IArgumentFilePatterns } from '..';

export interface IFileUtils {
  computeFiles(
    argumentFilePatterns: IArgumentFilePatterns[],
    rootDir: string
  ): IArgumentFilePatterns[];

  computeFileContents(
    argumentFilePatterns: IArgumentFilePatterns[]
  ): IArgumentFileContents[];

  readFileAsArray(fileName: string): string[];

  searchFilesForPatterns(patterns: string[], rootDir: string): string[];
}
