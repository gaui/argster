import { Builder, IBuilderOptions } from '../../../src';
import { IUtilsParam } from '../../../src/api/utils';
import { ILogUtils } from '../../../src/api/utils/log';
import { BuilderUtils, FileUtils, utilFactory } from '../../../src/utils';
import * as mock from '../../__mocks__/basic';

const extensions = [
  {
    patterns: ['non_existent.env'],
    prefix: '--env'
  }
];

const createBuilder = (options?: IBuilderOptions, extraUtils?: IUtilsParam) => {
  const newUtils = utilFactory(extraUtils);
  const newBuilder = new Builder({ rootDir: __dirname, ...options }, newUtils);
  return newBuilder;
};

describe('default options', () => {
  const builderUtils = new BuilderUtils();
  const defaultOptions = builderUtils.parseOptions();

  test('it should have same root directory as current working directory', () => {
    expect(defaultOptions.rootDir).toBe(process.cwd());
  });

  test('it should have empty dynamic variables', () => {
    expect(defaultOptions.dynamicVariables).toMatchObject({});
  });

  test('it should not skip unresolved variables', () => {
    expect(defaultOptions.skipUnresolvedVariables).toBeFalsy();
  });

  test('it should warn on unresolved variables', () => {
    expect(defaultOptions.warnUnresolvedVariables).toBeTruthy();
  });

  test('it should not throw exception for unresolved variables', () => {
    expect(defaultOptions.throwUnresolvedVariables).toBeFalsy();
  });

  test('it should have a specific variable pattern', () => {
    const expectedPattern = /\$\{(.+)\}/;

    expect(defaultOptions.variablePattern).toEqual(expectedPattern);
  });

  test('it should have bash as shell', () => {
    expect(defaultOptions.shell).toBe('/bin/bash');
  });

  test('it should have specific default transformers', () => {
    const expectedTransformers = ['sentencesInQuotes'];

    expect(Object.keys(defaultOptions.transformers!)).toEqual(
      expect.arrayContaining(expectedTransformers)
    );
  });
});

describe('creating commands with default builder options', () => {
  test('it should warn on unresolved variable', () => {
    const mockLogUtil: ILogUtils = {
      warn: jest.fn()
    };

    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mockLogUtil };

    const builder = createBuilder(undefined, utils);
    builder.createCommand('test', extensions);
    expect(mockLogUtil.warn).toBeCalledWith('Variable ${BAR} was not resolved');
  });

  test('it should not throw on unresolved variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = {
      file: new FileUtils(fs),
      log: mock.logUtils
    };

    const builder = createBuilder({ throwUnresolvedVariables: false }, utils);

    expect(() => {
      builder.createCommand('test', extensions);
    }).not.toThrow();
  });
});

describe('creating commands with non-default builder options', () => {
  test('it should warn on unresolved variable', () => {
    const mockLogUtil: ILogUtils = {
      warn: jest.fn()
    };

    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mockLogUtil };

    const builder = createBuilder({ warnUnresolvedVariables: true }, utils);
    builder.createCommand('test', extensions);
    expect(mockLogUtil.warn).toBeCalledWith('Variable ${BAR} was not resolved');
  });

  test('it should not warn on unresolved variable', () => {
    const mockLogUtil: ILogUtils = { warn: jest.fn() };

    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mockLogUtil };

    const builder = createBuilder({ warnUnresolvedVariables: false }, utils);
    builder.createCommand('test', extensions);
    expect(mockLogUtil.warn).not.toBeCalled();
  });

  test('it should throw on unresolved variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = {
      file: new FileUtils(fs),
      log: mock.logUtils
    };

    const builder = createBuilder({ throwUnresolvedVariables: true }, utils);

    expect(() => {
      builder.createCommand('test', extensions);
    }).toThrow();
  });

  test('it should not throw on unresolved variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = createBuilder({ throwUnresolvedVariables: false }, utils);

    expect(() => {
      builder.createCommand('test', extensions);
    }).not.toThrow();
  });
});
