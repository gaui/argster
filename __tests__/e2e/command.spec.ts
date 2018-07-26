import * as path from 'path';
import { Builder, IArgumentFilePatterns, IBuilder, IBuilderOptions } from '../../src';
import { Command } from '../../src/command';
import MockBuilder from '../__mocks__/Builder';

const rootDir = path.join(__dirname, 'data');

const extensions: IArgumentFilePatterns[] = [
  {
    patterns: ['**/*.env'],
    prefix: '--env'
  },
  {
    patterns: ['**/*.vol'],
    prefix: '-v'
  }
];

const createBuilder = (options? : IBuilderOptions) =>
  new Builder(Object.assign({}, { rootDir }, options));

describe('creating commands', () => {
  let builder: IBuilder;

  beforeEach(() => {
    builder = createBuilder();
  });

  test('it should create and execute command', () => {
    const mBuilder = new MockBuilder();
    const cmd = mBuilder.createCommand('test', extensions);
    cmd.exec();

    expect(mBuilder.createCommand).toHaveBeenCalledTimes(1);
    expect(cmd.exec).toHaveBeenCalledTimes(1);
  });

  test('it should return a command object', () => {
    const cmd = builder.createCommand('test', extensions);

    expect(cmd).toBeInstanceOf(Command);
  });

  test('it should return correct amount of commands', () => {
    const count = 3;
    [...Array(count)].forEach(i => {
      builder.createCommand('test', extensions);
    });
    const cmds = builder.getAllCommands();

    expect(cmds.length).toBe(count);
  });

  test('it should return a single command', () => {
    const cmd = builder.createCommand('test');

    expect(cmd.toString()).toBe('test');
  });

  test('it should return a command with an argument prepended', () => {
    const cmd = builder.createCommand('foo');
    cmd.prependArgument('bar');

    expect(cmd.toString()).toBe('foo bar');
  });

  test('it should return a command with an argument appended', () => {
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('bar');

    expect(cmd.toString()).toBe('foo bar');
  });

  test('it should return a command with arguments appended in right order', () => {
    const cmd = builder.createCommand('foo');
    cmd.appendArgument('arg1');
    cmd.appendArgument('arg2');

    expect(cmd.toString()).toBe('foo arg1 arg2');
  });

  test('it should return a command with arguments both prepended and appended', () => {
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

  test('it should return a long command without quotes', () => {
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test foo bar baz');
  });

  test('it should return a long command without quotes', () => {
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test foo bar baz');
  });

  test('it should return a long command with quotes', () => {
    const customBuilder = createBuilder({ sentencesInQuotes: true });
    const cmd = customBuilder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test "foo bar baz"');
  });
});
