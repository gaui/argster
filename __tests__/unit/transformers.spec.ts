import * as transformers from '../../src/transformer';
import * as mock from '../__mocks__/basic';

describe('transformers', () => {
  test('it should transform on first valid transformer (2nd)', () => {
    const t = transformers.multiple<any, any>([
      {
        predicate: (val: any) => val.indexOf('_') !== -1,
        replacer: (val: any) => `-${val}-`
      },
      {
        predicate: (val: any) => val.indexOf('_') === -1,
        replacer: (val: any) => `_${val}_`
      }
    ]);

    const v = t('foo');

    expect(v).toBe('_foo_');
  });

  test('it should transform on all valid transformers', () => {
    const t = transformers.multiple<any, any>([
      {
        predicate: () => true,
        replacer: (val: any) => `-${val}-`
      },
      {
        predicate: () => true,
        replacer: (val: any) => `_${val}_`
      }
    ]);

    const v = t('foo');

    expect(v).toBe('_-foo-_');
  });

  test('it should transform on all valid transformers', () => {
    const t = transformers.multiple<any, any>([
      {
        predicate: () => true,
        replacer: (val: any) => `-${val}-`
      },
      {
        predicate: () => true,
        replacer: (val: any) => `${val}${val}`
      }
    ]);

    const v = t('foo');

    expect(v).toBe('-foo--foo-');
  });
});

describe('creating commands with transformers enabled', () => {
  test('it should return a long command with quotes', () => {
    const builder = mock.createBuilder({
      transformers: ['sentencesInQuotes']
    });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test "foo bar baz"');
  });
});

describe('creating commands with transformers disabled', () => {
  test('it should return a long command without sentences in quotes', () => {
    const builder = mock.createBuilder({
      transformers: []
    });
    const cmd = builder.createCommand('test');
    cmd.appendArgument('foo bar baz');

    expect(cmd.toString()).toBe('test foo bar baz');
  });
});
