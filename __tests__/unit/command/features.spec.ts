import { Builder, IBuilderOptions } from '../../../src';
import { IUtilsParam } from '../../../src/api/utils';
import { utilFactory } from '../../../src/utils';

// tslint:disable no-empty

const createBuilder = (options?: IBuilderOptions, extraUtils?: IUtilsParam) => {
  const newUtils = utilFactory(extraUtils);
  const newBuilder = new Builder({ rootDir: __dirname, ...options }, newUtils);
  return newBuilder;
};

describe('creating commands with features enabled', () => {
  test('it should return a long command with quotes', () => {
    const builder = createBuilder({ features: { sentencesInQuotes: true } });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test "foo bar baz"');
  });
});

describe('creating commands with features disabled', () => {
  test('it should return a long command without sentences in quotes', () => {
    const builder = createBuilder({ features: { sentencesInQuotes: false } });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test foo bar baz');
  });
});
