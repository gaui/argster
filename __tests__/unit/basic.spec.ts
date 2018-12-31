import { FileUtils } from '../../src/utils';
import * as mock from '../__mocks__/basic';

const extensions = [
  {
    patterns: ['non_existent.env'],
    prefix: '--env'
  }
];

describe('creating commands', () => {
  test('it should return a single command', () => {
    const builder = mock.createBuilder();
    const cmd = builder.createCommand('test');

    expect(cmd.toString()).toBe('test');
  });

  test('it should return a command with an argument prepended', () => {
    const builder = mock.createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.prependArgument('bar');

    expect(cmd.toString()).toBe('foo bar');
  });

  test('it should return a command with an argument appended', () => {
    const builder = mock.createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('bar');

    expect(cmd.toString()).toBe('foo bar');
  });

  test('it should return a command with arguments appended in right order', () => {
    const builder = mock.createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('arg1');
    cmd.appendArgument('arg2');

    expect(cmd.toString()).toBe('foo arg1 arg2');
  });

  test('it should return a command with arguments appended in right order (FP style)', () => {
    const builder = mock.createBuilder();
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('arg1').appendArgument('arg2');

    expect(cmd.toString()).toBe('foo arg1 arg2');
  });

  test('it should return a command with arguments both prepended and appended', () => {
    const builder = mock.createBuilder();
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

  test('it should return a command with arguments both prepended and appended (FP style)', () => {
    const builder = mock.createBuilder();
    const cmd = builder.createCommand('foo');
    cmd
      .appendArgument('append3')
      .appendArgument('append1')
      .prependArgument('prepend1')
      .appendArgument('append2')
      .prependArgument('prepend2')
      .prependArgument('prepend3');

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

    const builder = mock.createBuilder(
      { dynamicVariables: { BAR: () => 'someValue' } },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=someValue');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });

  test('it should resolve multiple dynamic variables', () => {
    const val = `
      FOO=\${BAR}
      BAR=\${FOO}
    `;
    const fs = mock.fs(val);
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(
      { dynamicVariables: { FOO: () => 'fooValue', BAR: () => 'someValue' } },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=someValue --env BAR=fooValue');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });

  test('it should only resolve some dynamic variables', () => {
    const val = `
      FOO=\${BAR}
      BAR=\${FOO}
    `;
    const fs = mock.fs(val);
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(
      { dynamicVariables: { FOO: () => 'fooValue' } },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO= --env BAR=fooValue');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });

  test('it should resolve both string and function dynamic variables', () => {
    const val = `
      FOO=\${BAR}
      BAR=\${FOO}
    `;
    const fs = mock.fs(val);
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(
      { dynamicVariables: { FOO: 'fooValue', BAR: () => 'someValue' } },
      utils
    );

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=someValue --env BAR=fooValue');
    expect(fs.readFileSync).toBeCalledTimes(1);
  });

  test('it should not resolve dynamic variable', () => {
    const fs = mock.fs('FOO=${BAR}');
    const utils = { file: new FileUtils(fs), log: mock.logUtils };

    const builder = mock.createBuilder(undefined, utils);

    const cmd = builder.createCommand('test', extensions);

    expect(cmd.toString()).toBe('test --env FOO=');
  });
});
