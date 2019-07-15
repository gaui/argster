interface IUtilsParam {
  builder?: IBuilderUtils;
  command?: ICommandUtils;
  file?: IFileUtils;
  log?: ILogUtils;
}

interface IUtils {
  builder: IBuilderUtils;
  command: ICommandUtils;
  file: IFileUtils;
  log: ILogUtils;
}
