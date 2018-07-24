import Command from './command';
import {
  IArgumentFiles,
  IBuilder,
  IBuilderOptions,
  ICommand
} from './interfaces';
import { BuilderUtils } from './utils';

class Builder implements IBuilder {
  public commands: ICommand[];
  public options: IBuilderOptions;

  constructor(options?: IBuilderOptions) {
    this.commands = [];
    this.options = BuilderUtils.parseOptions(options);
  }

  public createCommand(filePatterns: IArgumentFiles[]): ICommand {
    const command = new Command(filePatterns, this.options);
    this.commands.push(command);
    return command;
  }

  public getAllCommands(): ICommand[] {
    return this.commands;
  }
}

export default Builder;
