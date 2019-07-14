import { BuilderUtils, CommandUtils, FileUtils, LogUtils } from '.';

const factory = (utils?: IUtilsParam): IUtils => ({
  builder: (utils && utils.builder) || new BuilderUtils(),
  command: (utils && utils.command) || new CommandUtils(),
  file: (utils && utils.file) || new FileUtils(),
  log: (utils && utils.log) || new LogUtils()
});

export default factory;
