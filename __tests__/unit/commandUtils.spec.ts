import { CommandUtils } from '../../src/utils';

describe('parseArgumentInput', () => {
  const utils = new CommandUtils();

  test('single string returns array with one argument object', () => {
    const result = utils.parseArgumentInput('value');
    expect(result.length).toBe(1);
    expect(result).toEqual([{ argument: 'value' }]);
  });

  test('array of strings returns array of argument objects', () => {
    const result = utils.parseArgumentInput(['foo', 'bar']);
    expect(result.length).toBe(2);
    expect(result).toEqual([
      { argument: 'foo' },
      { argument: 'bar' }
    ]);
  });

  test('array mixing objects and strings', () => {
    const input = [
      { argument: 'one', prefix: '--opt' },
      'two'
    ];
    const result = utils.parseArgumentInput(input);
    expect(result.length).toBe(2);
    expect(result).toEqual([
      { argument: 'one', prefix: '--opt' },
      { argument: 'two' }
    ]);
  });

  test('empty array returns empty result', () => {
    const result = utils.parseArgumentInput([]);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});
