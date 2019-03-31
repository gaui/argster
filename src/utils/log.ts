import { ILogUtils } from '../api/utils/log';

export default class LogUtils implements ILogUtils {
  // tslint:disable-next-line:no-console
  public warn = console.warn;
}
