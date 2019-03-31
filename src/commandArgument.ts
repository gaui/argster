import { IBuilderOptions, ICommandArgument } from './api';
import { IUtils } from './api/utils';
import { VariableUnresolvableException } from './exceptions';
import * as transformers from './transformer';
import { factory as utilFactory } from './utils';

class CommandArgument implements ICommandArgument {
  public argument: string;
  public prefix?: string;

  private utils: IUtils;

  public constructor(
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

  public toString(): string {
    const prefix = this.prefix ? this.prefix + ' ' : '';
    return `${prefix}${this.argument} `;
  }

  private reducer(builderOptions: IBuilderOptions, argument: string): string {
    const fns = [
      this.resolveDynamicVariable.bind(this),
      this.applyTransformers.bind(this),
      this.convertVariables.bind(this)
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
    if (!builderOptions.transformers || !builderOptions.transformers.length) {
      return argument;
    }

    const transformerList = builderOptions.transformers.map(t =>
      typeof t === 'string' ? transformers.transformers[t] : t
    );
    const resolvedValue = transformers.multiple(transformerList)(argument);

    return resolvedValue;
  }

  private resolveDynamicVariable(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined {
    if (!argument || !builderOptions.dynamicVariables) {
      return argument;
    }

    const dynVariables = builderOptions.dynamicVariables;
    const dynVarPattern = builderOptions.variablePattern;

    const replacerFn = (match: string, actualValue: string): string => {
      const resolvedValue = transformers.one(transformers.transformers.raw)(
        dynVariables[actualValue]
      );

      if (!resolvedValue) {
        const unresolved = new VariableUnresolvableException({
          argument,
          original: match,
          variable: actualValue
        });

        if (builderOptions.warnUnresolvedVariables) {
          this.utils.log.warn(unresolved.toString());
        }

        if (
          builderOptions.throwUnresolvedVariables ||
          builderOptions.skipUnresolvedVariables
        ) {
          throw unresolved;
        }
      }

      return resolvedValue || '';
    };

    if (!dynVarPattern) return argument;
    try {
      const arg = argument.replace(
        new RegExp(dynVarPattern, 'gim'),
        replacerFn
      );

      return arg.trim();
    } catch (e) {
      // TODO: Logging
      throw e;
    }
  }

  private convertVariables(
    builderOptions: IBuilderOptions,
    argument?: string
  ): string | undefined {
    if (!argument || !builderOptions.convertVariables) {
      return argument;
    }

    const fromPattern = builderOptions.convertVariables[1].from;
    const toPattern = builderOptions.convertVariables[1].to;

    const resolvedValue = argument.replace(fromPattern, toPattern);

    return resolvedValue;
  }
}

export default CommandArgument;
