import { IArgumentFilePatterns } from '.';

export interface IArgumentFileContents {
  files: IArgumentFilePatterns;
  contents: string[];
}
