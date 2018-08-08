/* tslint:disable:no-empty-interface */

export interface IArgumentFilePatterns {
  prefix: string;
  patterns: string[];
}

export interface IArgumentFileContents {
  files: IArgumentFilePatterns;
  contents: string[];
}

export interface IDynamicVariables {
  [key: string]: () => any;
}
