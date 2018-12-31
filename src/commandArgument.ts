import { IBuilderOptions, ICommandArgument } from './api';
import { IUtils } from './api/utils';
import { VariableUnresolvableException } from './exceptions';
import * as transformers from './transformer';
import { factory as utilFactory } from './utils';

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
    if (builderOptions.transformers && !builderOptions.transformers.length) {
      return argument;
    }

    const enabledTransformers = transformers.transformers.defaults.filter(
      x => builderOptions.transformers!.indexOf(x.name) !== -1
    );

    const resolvedValue = new transformers.Transformer(enabledTransformers).all(
      argument
    );
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

    const replacerFn = (match: any, actualValue: any): string => {
      const resolvedValue = new transformers.Transformer(
        transformers.transformers.dynamicVar
      ).first(dynVariables[actualValue]);

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
