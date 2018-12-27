import { CommandArgumentInput, ICommandArgument } from '..';

export interface ICommandUtils {
  parseArgumentInput(args: CommandArgumentInput): ICommandArgument[];
}
