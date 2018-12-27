import {
  IArgumentFilePatterns,
  IBuilder,
  IBuilderOptions,
  ICommand
} from './api';
import { IBuilderUtils } from './api/utils/builder';
import { Command } from './command';
import { BuilderUtils } from './utils';

class Builder implements IBuilder {
  public builderUtils: IBuilderUtils = new BuilderUtils();

  public commands: ICommand[];
  public options: IBuilderOptions;

  constructor(options?: IBuilderOptions) {
    this.commands = [];
    this.options = this.builderUtils.parseOptions(options);
  }

  public createCommand(
    command: string,
    filePatterns?: IArgumentFilePatterns[]
  ): ICommand {
    const cmd = new Command(this.options, command, filePatterns);
    this.commands.push(cmd);
    return cmd;
  }

  public getAllCommands(): ICommand[] {
    return this.commands;
  }
}

export default Builder;
