import * as transformers from '../transformer';

export default class CommandUtils implements ICommandUtils {
  public parseArgumentInput(args: TCommandArgumentInput): ICommandArgument[] {
    const argArray = (Array.isArray(args) ? args : [args])
      .map((a: ICommandArgument) => {
        return transformers.multiple<
          string | ICommandArgument,
          ICommandArgument
        >([
          {
            predicate: (val: ICommandArgument) => typeof val === 'object',
            replacer: (val: ICommandArgument) => val
          },
          {
            predicate: (val: string) => typeof val === 'string',
            replacer: (val: string) => ({ argument: val })
          }
        ])(a);
      })
      .filter(Boolean);

    return (argArray || []) as ICommandArgument[];
  }
}
