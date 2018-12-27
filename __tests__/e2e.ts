import * as path from 'path';
import {
  Builder,
  IArgumentFilePatterns,
  IBuilder,
  IBuilderOptions
} from '../src';
import { Command } from '../src/command';

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

const createBuilder = (options?: IBuilderOptions) =>
  new Builder(Object.assign({}, { rootDir }, options));

describe('creating commands', () => {
  let builder: IBuilder;

  beforeEach(() => {
    builder = createBuilder();
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
});
