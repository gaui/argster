import { ILogUtils } from '../api/utils/log';

export default class LogUtils implements ILogUtils {
  public warn = console.warn;
}
