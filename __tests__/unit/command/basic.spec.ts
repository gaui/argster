import { Builder, IBuilderOptions } from '../../../src';
import { IUtilsParam } from '../../../src/api/utils';
import { factory as utilFactory, FileUtils } from '../../../src/utils';
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

describe('creating commands', () => {
  test('it should return a single command', () => {
    const builder = createBuilder();
    const cmd = builder.createCommand('test');

    expect(cmd.toString()).toBe('test');
  });

  test('it should return a command with an argument prepended', () => {
    const builder = createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.prependArgument('bar');

    expect(cmd.toString()).toBe('foo bar');
  });

  test('it should return a command with an argument appended', () => {
    const builder = createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('bar');

    expect(cmd.toString()).toBe('foo bar');
  });

  test('it should return a command with arguments appended in right order', () => {
    const builder = createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('arg1');
    cmd.appendArgument('arg2');

    expect(cmd.toString()).toBe('foo arg1 arg2');
  });

  test('it should return a command with arguments both prepended and appended', () => {
    const builder = createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('append3');
    cmd.appendArgument('append1');
    cmd.prependArgument('prepend1');
    cmd.appendArgument('append2');
    cmd.prependArgument('prepend2');
    cmd.prependArgument('prepend3');

    expect(cmd.toString()).toBe(
      'foo prepend3 prepend2 prepend1 append3 append1 append2'
    );
  });

  test('it should resolve dynamic variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = {
      file: new FileUtils(fs),
      log: mock.logUtils
    };

    const builder = createBuilder(
      { dynamicVariables: { BAR: () => 'someValue' } },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=someValue');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });

  test('it should not resolve dynamic variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = createBuilder(undefined, utils);

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=');
  });
});
