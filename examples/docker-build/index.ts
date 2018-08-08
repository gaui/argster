import { inspect } from 'util';
import { Builder, IBuilderOptions, ICommand } from '../../src'; // replace with 'argster'
import { IArgumentFilePatterns, ICommandProcessOutput } from '../../src/api';

// tslint:disable:no-console

const extensions: IArgumentFilePatterns[] = [
  {
    patterns: ['**/*.lbl'],
    prefix: '--label'
  }
];

const tag = 'myimage:latest';
const dockerFile = './Dockerfile';

const options: IBuilderOptions = {
  dynamicVariables: {
    BUILD_DATE: () => new Date().toISOString().slice(0, 10)
  }
};

const builder = new Builder(options);
const cmd: ICommand = builder.createCommand('docker build .', extensions);
console.log(inspect(cmd, { depth: 4 }));
cmd.prependArgument({ prefix: '-t', argument: tag });
cmd.prependArgument({ prefix: '-f', argument: dockerFile });
const cmdProcess = cmd.exec();
cmdProcess.promise
  .then((output: ICommandProcessOutput) => {
    console.log(output);
  })
  .catch(err => {
    console.log(err);
  });
