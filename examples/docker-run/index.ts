import { inspect } from 'util';
import { Builder, IArgumentFilePatterns, ICommand } from '../../src'; // replace with 'argster'
import { ICommandProcessOutput } from '../../src/api';

// tslint:disable:no-console

const extensions: IArgumentFilePatterns[] = [
  {
    patterns: ['**/*.env'],
    prefix: '-e'
  },
  {
    patterns: ['**/*.vol'],
    prefix: '-v'
  }
];

const tag = 'ubuntu:18.04';

const builder = new Builder();
const cmd: ICommand = builder.createCommand('docker run', extensions);
cmd.prependArgument('--rm');
cmd.prependArgument('-i');
cmd.appendArgument(tag);
cmd.appendArgument('echo Hello World');
console.log(inspect(cmd, { depth: 4 }));
const cmdProcess = cmd.exec();
cmdProcess.promise
  .then((output: ICommandProcessOutput) => {
    console.log(output);
  })
  .catch(err => {
    console.log(err);
  });
