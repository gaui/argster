import {
  IBuilderOptions,
  ICommandArgument,
  ICommandEvalValueInput
} from './api';
import { ITransformer } from './api/transformers';
import { IUtils } from './api/utils';
import { IPredicate } from './api/utils/predicate';
import { VariableUnresolvableException } from './exceptions';
import transformers from './transformers';
import { factory as utilFactory, Predicate } from './utils';

class CommandArgument implements ICommandArgument {
  public argument: string;
  public prefix?: string;

  private utils: IUtils;

  constructor(
    builderOptions: IBuilderOptions,
    argument: string,
    prefix?: string,
    utils?: IUtils
  ) {
    this.utils = utils || utilFactory();

    const newArgument = this.reducer(builderOptions, argument);

    this.prefix = prefix ? prefix.trim() : undefined;
    this.argument = newArgument ? newArgument.trim() : '';
  }

  public toString() {
    const prefix = this.prefix ? this.prefix + ' ' : '';
    return `${prefix}${this.argument} `;
  }

  private reducer(builderOptions: IBuilderOptions, argument: string): string {
    const fns = [
      this.resolveDynamicVariable.bind(this),
      this.applyTransformers.bind(this)
    ];
    const newArgument = fns.reduce(
      (acc, fn) => fn(builderOptions, acc) || '',
      argument
    );

    return newArgument;
  }

  private applyTransformers(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined {
    if (!builderOptions.transformers) return;

    const transformersActive = Object.keys(transformers)
      .filter(x => builderOptions.transformers![x])
      .map(
        x =>
          ({
            predicate: transformers[x].predicate,
            replacer: transformers[x].replacer
          } as ICommandEvalValueInput<string, string>)
      );

    const transformerPredicate: IPredicate = new Predicate(transformersActive);
    const resolvedValue = transformerPredicate.all(argument);

    return resolvedValue;
  }

  private resolveDynamicVariable(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined {
    if (!argument || !builderOptions.dynamicVariables) return;

    const extractFn: Array<ITransformer<any, string>> = [
      {
        predicate: (val: () => string) => val instanceof Function,
        replacer: (val: () => string) => val()
      },
      {
        predicate: (val: string) => typeof val === 'string',
        replacer: (val: string) => val
      }
    ];

    const dynVariables = builderOptions.dynamicVariables;
    const dynPredicate: IPredicate = new Predicate(extractFn);
    const dynVarPattern = builderOptions.variablePattern;

    const replacerFn = (match: any, actualValue: any): string => {
      const resolvedValue = dynPredicate.first(dynVariables[actualValue]);
      if (!resolvedValue) {
        const unresolved = new VariableUnresolvableException({
          argument,
          original: match,
          variable: actualValue
        });

        if (builderOptions.warnUnresolvedVariables) {
          this.utils.log.warn(unresolved.toString());
        }

        if (builderOptions.skipUnresolvedVariables) return '';

        if (builderOptions.throwUnresolvedVariables) throw unresolved;
      }

      return resolvedValue || '';
    };

    try {
      const arg = argument.replace(
        new RegExp(dynVarPattern!, 'gim'),
        replacerFn
      );

      return arg.trim();
    } catch (e) {
      // TODO: Logging
      throw e;
    }
  }
}

export default CommandArgument;
