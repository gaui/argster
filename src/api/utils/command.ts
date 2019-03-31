import { ICommandArgument, TCommandArgumentInput } from '..';

export interface ICommandUtils {
  parseArgumentInput(args: TCommandArgumentInput): ICommandArgument[];
}
