import transformers from '../../../src/transformers';
import * as mock from '../../__mocks__/basic';

describe('creating commands with transformers enabled', () => {
  test('it should return a long command with quotes', () => {
    const builder = mock.createBuilder({
      transformers: {
        sentencesInQuotes: transformers.sentencesInQuotes
      }
    });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test "foo bar baz"');
  });
});

describe('creating commands with transformers disabled', () => {
  test('it should return a long command without sentences in quotes', () => {
    const builder = mock.createBuilder({
      transformers: {}
    });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test foo bar baz');
  });
});
