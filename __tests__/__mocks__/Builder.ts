import { IBuilder, ICommand } from '../../src';

const builder = jest.fn<IBuilder>(() => ({
  createCommand: jest.fn<ICommand>(() => ({
    exec: jest.fn()
  }))
}));

export default builder;
