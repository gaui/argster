import { Builder, IBuilder, IBuilderOptions } from '../src';
import { FileUtils, utilFactory } from '../src/utils';

let builder: IBuilder;

const createBuilder = (options?: IBuilderOptions) => {
  const mockFs = {
    readFileSync: () => 'FOOOOOOOOOOOOOOOOOOOOO'
  };
  const utils = utilFactory();
  utils.file = new FileUtils(mockFs, null);
  const newBuilder = new Builder(options, utils);
  return newBuilder;
};

describe('creating commands', () => {
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
});

describe('creating commands with features enabled', () => {
  test('it should return a long command with quotes', () => {
    builder = createBuilder({ features: { sentencesInQuotes: true } });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test "foo bar baz"');
  });
});

describe('creating commands with features disabled', () => {
  test('it should return a long command without sentences in quotes', () => {
    builder = createBuilder({ features: { sentencesInQuotes: false } });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test foo bar baz');
  });
});
