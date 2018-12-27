export type TFeature = {
  [key in keyof IBuilderOptions]: ICommandEvalValueInput<any, any>
};
