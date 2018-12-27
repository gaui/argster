import * as path from 'path';
import { Builder, IBuilder, IBuilderOptions } from '../src';

const rootDir = path.join(__dirname, 'data');

const createBuilder = (options?: IBuilderOptions) => {
  const builder = new Builder(Object.assign({}, { rootDir }, options));
  return builder;
  // builder.utils = set mockable version of BuilderUtils
  // const builder = jest.fn<IBuilder>(() => ({
  //   createCommand: jest.fn<ICommand>(() => ({
  //     exec: jest.fn()
  //   }))
  // }));
};

describe('creating commands', () => {
  let builder: IBuilder;

  beforeEach(() => {
    builder = createBuilder();
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
    const custobuilder = createBuilder({ sentencesInQuotes: true });
    const cmd = custobuilder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test "foo bar baz"');
  });
});
