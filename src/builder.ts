import {
  IArgumentFilePatterns,
  IBuilder,
  IBuilderOptions,
  ICommand
} from './api';
import { IUtils } from './api/utils';
import Command from './command';
import utilFactory from './utils/factory';

class Builder implements IBuilder {
  public commands: ICommand[];
  public options: IBuilderOptions;

  private utils: IUtils;

  public constructor(options?: IBuilderOptions, utils?: IUtils) {
    this.utils = utils || utilFactory();
    this.commands = [];
    this.options = this.utils.builder.parseOptions(options);
  }

  public createCommand(
    command: string,
    filePatterns?: IArgumentFilePatterns[]
  ): ICommand {
    const cmd = new Command(this.options, command, filePatterns, this.utils);
    this.commands.push(cmd);
    return cmd;
  }

  public getAllCommands(): ICommand[] {
    return this.commands;
  }
}

export default Builder;
