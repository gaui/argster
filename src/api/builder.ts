import { ICommand } from './command';
import { IArgumentFilePatterns, IBuilderOptions } from './options';

export interface IBuilder {
  options: IBuilderOptions;
  /**
   * Create a new command and register it in the builder
   * @param command Main command, e.g. 'docker build'
   * @param filePatterns Command argument prefix and glob file patterns
   * @returns A new command object
   */
  createCommand(
    command: string,
    filePatterns?: IArgumentFilePatterns[]
  ): ICommand;

  /**
   * Get all commands that are registered in the builder
   * @returns Array of command objects
   */
  getAllCommands(): ICommand[];
}
