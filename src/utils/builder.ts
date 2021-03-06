import { defaultOptions } from '../defaults';

export default class BuilderUtils implements IBuilderUtils {
  public parseOptions = (options?: IBuilderOptions): IBuilderOptions =>
    Object.assign({}, defaultOptions, options);
}
