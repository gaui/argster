import { IBuilderUtils } from './builder';
import { ICommandUtils } from './command';
import { IFileUtils } from './file';
import { ILogUtils } from './log';

export interface IUtils {
  builder: IBuilderUtils;
  command: ICommandUtils;
  file: IFileUtils;
  log: ILogUtils;
}
