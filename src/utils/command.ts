import { ICommandArgument, TCommandArgumentInput } from '../api';
import { ICommandUtils } from '../api/utils/command';
import * as transformers from '../transformer';

export default class CommandUtils implements ICommandUtils {
  public parseArgumentInput(args: TCommandArgumentInput): ICommandArgument[] {
    const argArray: ICommandArgument[] | any = (Array.isArray(args)
      ? args
      : [args]
    )
      .map(
        (a: ICommandArgument): ICommandArgument | undefined => {
          return transformers.multiple([
            {
              predicate: (val: any) => typeof val === 'object',
              replacer: (val: any) => val
            },
            {
              predicate: (val: any) => typeof val === 'string',
              replacer: (val: string) => ({ argument: val })
            }
          ])(a);
        }
      )
      .filter(Boolean);

    return argArray || [];
  }
}
