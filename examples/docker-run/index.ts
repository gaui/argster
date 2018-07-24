import { inspect } from 'util';
import {
  Builder,
  IArgumentFiles,
  ICommand,
  ICommandProcessOutput
} from '../../src'; // replace with 'argster'

// tslint:disable:no-console

const extensions: IArgumentFiles[] = [
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
const cmd: ICommand = builder.createCommand(extensions);
cmd.prependArgument('docker run -i --rm');
cmd.appendArgument(tag);
cmd.appendArgument('echo Hello World');
console.log(inspect(cmd, { depth: 4 }));
cmd
  .exec()
  .then((output: ICommandProcessOutput) => {
    console.log(output);
  })
  .catch(err => {
    console.log(err);
  });

/*

OUTPUT:

Command {
  builderOptions: { debug: false, dynamicVariables: {}, logger: Logger {} },
  files:
   [ { patterns: [ 'examples/docker-run/variables.env' ],
       prefix: '-e' },
     { patterns: [ 'examples/docker-run/volumes.vol' ],
       prefix: '-v' } ],
  arguments:
   [ CommandArgument {
       argumentBefore: 'docker run -i --rm',
       argument: 'docker run -i --rm' },
     CommandArgument {
       prefix: '-e',
       argumentBefore: 'KUBECONFIG=kubeconfig',
       argument: 'KUBECONFIG=kubeconfig' },
     CommandArgument {
       prefix: '-v',
       argumentBefore: '/$PWD/:/data',
       argument: '/$PWD/:/data' },
     CommandArgument {
       prefix: '-v',
       argumentBefore: '/$HOME/.aws:/root/.aws',
       argument: '/$HOME/.aws:/root/.aws' },
     CommandArgument { argumentBefore: 'ubuntu:18.04', argument: 'ubuntu:18.04' },
     CommandArgument {
       argumentBefore: 'echo Hello World',
       argument: 'echo Hello World' } ] }
{ stdout: 'Hello World\n', stderr: '' }

*/
