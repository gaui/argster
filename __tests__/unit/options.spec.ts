import { ILogUtils } from '../../src/api/utils/log';
import { BuilderUtils, FileUtils } from '../../src/utils';
import * as mock from '../__mocks__/basic';

const extensions = [
  {
    patterns: ['non_existent.env'],
    prefix: '--env'
  }
];

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

  test('it should have a specific line ignore pattern', () => {
    const expectedPattern = /^(\#|\/{2,})/;

    expect(defaultOptions.lineIgnorePattern).toEqual(expectedPattern);
  });

  test('it should not convert variables', () => {
    expect(defaultOptions.convertVariables).toBeFalsy();
  });

  test('it should have bash as shell', () => {
    expect(defaultOptions.shell).toBe('/bin/bash');
  });

  test('it should have specific default transformers', () => {
    const expectedTransformers = ['sentencesInQuotes'];

    expect(defaultOptions.transformers!).toEqual(
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

    const builder = mock.createBuilder(undefined, utils);
    builder.createCommand('test', extensions);
    expect(mockLogUtil.warn).toBeCalledWith('Variable ${BAR} was not resolved');
  });

  test('it should not throw on unresolved variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = {
      file: new FileUtils(fs),
      log: mock.logUtils
    };

    const builder = mock.createBuilder(undefined, utils);

    expect(() => {
      builder.createCommand('test', extensions);
    }).not.toThrow();
  });

  test('it should skip comment lines based on line ignore pattern', () => {
    const content = `
      ## FOO=BAR
      BAR=FOO
      // SMU=BAZ
    `;
    const fs = mock.fs(content);
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(undefined, utils);

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env BAR=FOO');
  });

  test('it should not convert variables', () => {
    const fs = mock.fs('FOO=%BAR%');
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(undefined, utils);

    const cmd = builder.createCommand('test', extensions);

    expect(builder.options.convertVariables).toBeFalsy();
    expect(cmd.toString()).toBe('test --env FOO=%BAR%');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });
});

describe('creating commands with non-default builder options', () => {
  test('it should warn on unresolved variable', () => {
    const mockLogUtil: ILogUtils = {
      warn: jest.fn()
    };

    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mockLogUtil };

    const builder = mock.createBuilder(
      { warnUnresolvedVariables: true },
      utils
    );
    builder.createCommand('test', extensions);
    expect(mockLogUtil.warn).toBeCalledWith('Variable ${BAR} was not resolved');
  });

  test('it should not warn on unresolved variable', () => {
    const mockLogUtil: ILogUtils = { warn: jest.fn() };

    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mockLogUtil };

    const builder = mock.createBuilder(
      { warnUnresolvedVariables: false },
      utils
    );
    builder.createCommand('test', extensions);
    expect(mockLogUtil.warn).not.toBeCalled();
  });

  test('it should throw on unresolved variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = {
      file: new FileUtils(fs),
      log: mock.logUtils
    };

    const builder = mock.createBuilder(
      { throwUnresolvedVariables: true },
      utils
    );

    expect(() => {
      builder.createCommand('test', extensions);
    }).toThrow();
  });

  test('it should not throw on unresolved variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(
      { throwUnresolvedVariables: false },
      utils
    );

    expect(() => {
      builder.createCommand('test', extensions);
    }).not.toThrow();
  });

  test('it should skip unresolved variables', () => {
    const val = `
      FOO=\${BAR}
      BAR=\${FOO}
    `;
    const fs = mock.fs(val);
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(
      {
        dynamicVariables: { FOO: () => 'fooValue' },
        skipUnresolvedVariables: true
      },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env BAR=fooValue');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });

  test('it should convert variables from Windows format to Linux format', () => {
    const fs = mock.fs('FOO=%BAR%');
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(
      { convertVariables: [true, { from: /\%([A-Z]+)\%/, to: '$$$1' }] },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=$BAR');
  });
});
