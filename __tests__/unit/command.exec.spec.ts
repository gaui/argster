import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Mock child_process.exec before importing Command
var mockExec: ReturnType<typeof vi.fn>;
vi.mock('child_process', () => {
  mockExec = vi.fn();
  return { exec: (...args: unknown[]) => mockExec(...args) };
});

import { Builder } from '../../src';
import Command from '../../src/command';

interface MockProcess extends EventEmitter {
  stdout: EventEmitter;
  stderr: EventEmitter;
}

const createMockProcess = (): MockProcess => {
  const proc = new EventEmitter() as MockProcess;
  proc.stdout = new EventEmitter();
  proc.stderr = new EventEmitter();
  return proc;
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('Command.exec', () => {
  test('resolves with collected output and passes chunks to callbacks', async () => {
    const proc = createMockProcess();
    mockExec.mockReturnValue(proc);

    const builder = new Builder();
    const cmd = builder.createCommand('foo');

    const stdoutCb = vi.fn();
    const stderrCb = vi.fn();

    const { promise } = cmd.exec(stdoutCb, stderrCb);

    proc.stdout.emit('data', 'out1');
    proc.stderr.emit('data', 'err1');
    proc.stdout.emit('data', 'out2');
    proc.emit('close', 0, null);

    const result = await promise;

    expect(result.stdout).toEqual(['out1', 'out2']);
    expect(result.stderr).toEqual(['err1']);
    expect(stdoutCb).toHaveBeenCalledWith('out1');
    expect(stdoutCb).toHaveBeenCalledWith('out2');
    expect(stderrCb).toHaveBeenCalledWith('err1');
  });

  test('rejects the promise on non-zero exit code', async () => {
    const proc = createMockProcess();
    mockExec.mockReturnValue(proc);

    const builder = new Builder();
    const cmd = builder.createCommand('foo');

    const { promise } = cmd.exec();

    proc.emit('close', 1, null);

    await expect(promise).rejects.toEqual({
      code: 1,
      signal: null,
      stdout: [],
      stderr: []
    });
  });
});
