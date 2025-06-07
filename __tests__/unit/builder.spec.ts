import * as mock from '../__mocks__/basic';

describe('getAllCommands', () => {
  test('it should return commands in creation order', () => {
    const builder = mock.createBuilder();
    const first = builder.createCommand('first');
    const second = builder.createCommand('second');
    const third = builder.createCommand('third');

    const cmds = builder.getAllCommands();

    expect(cmds.length).toBe(3);
    expect(cmds[0]).toBe(first);
    expect(cmds[1]).toBe(second);
    expect(cmds[2]).toBe(third);
  });
});
