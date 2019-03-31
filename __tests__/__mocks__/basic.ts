import { Builder, IBuilderOptions } from '../../src';
import { IUtilsParam } from '../../src/api/utils';
import { ILogUtils } from '../../src/api/utils/log';
import { factory as utilFactory } from '../../src/utils';

export const fs = (str: string): typeof import('fs') => {
  const rfs = ({
    readFileSync: jest.fn(() => str)
  } as unknown) as typeof import('fs');
  return rfs;
};

export const logUtils: ILogUtils = { warn: jest.fn() };

export const createBuilder = (
  options?: IBuilderOptions,
  extraUtils?: IUtilsParam
): Builder => {
  const newUtils = utilFactory(extraUtils);
  const newBuilder = new Builder({ rootDir: __dirname, ...options }, newUtils);
  return newBuilder;
};
