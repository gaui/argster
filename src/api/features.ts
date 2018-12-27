import { ICommandEvalValueInput } from '.';

export interface IAvailableFeatures {
  // Automatically put single quotes around sentences
  // default: true
  sentencesInQuotes?: boolean;
}

export type TFeatureEvaluator = {
  [key in keyof IAvailableFeatures]: ICommandEvalValueInput<any, any>
};
