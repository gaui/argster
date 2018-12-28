import { ILogUtils } from '../../src/api/utils/log';

export const fs = (str: string) => {
  const rfs = { readFileSync: jest.fn(() => str) };
  return rfs;
};

export const logUtils: ILogUtils = { warn: jest.fn() };
