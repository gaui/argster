import { Builder } from '../../src';
import utilFactory from '../../src/utils/factory';

export const fs = (str: string): typeof import('fs') => {
  const rfs = ({
    readFileSync: vi.fn(() => str)
  } as unknown) as typeof import('fs');
  return rfs;
};

export const logUtils: ILogUtils = { warn: vi.fn() };

export const createBuilder = (
  options?: IBuilderOptions,
  extraUtils?: IUtilsParam
): Builder => {
  const newUtils = utilFactory(extraUtils);
  const newBuilder = new Builder({ rootDir: import.meta.dirname, ...options }, newUtils);
  return newBuilder;
};
