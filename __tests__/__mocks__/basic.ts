import { Builder, IBuilderOptions } from '../../src';
import { IUtilsParam } from '../../src/api/utils';
import { ILogUtils } from '../../src/api/utils/log';
import { factory as utilFactory } from '../../src/utils';

export const fs = (str: string) => {
  const rfs = { readFileSync: jest.fn(() => str) };
  return rfs;
};

export const logUtils: ILogUtils = { warn: jest.fn() };

export const createBuilder = (
  options?: IBuilderOptions,
  extraUtils?: IUtilsParam
) => {
  const newUtils = utilFactory(extraUtils);
  const newBuilder = new Builder({ rootDir: __dirname, ...options }, newUtils);
  return newBuilder;
};
