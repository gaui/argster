import { inspect } from 'util';
import {
  Builder,
  IArgumentFiles,
  IBuilderOptions,
  ICommand,
  ICommandProcessOutput
} from '../../src'; // replace with 'argster'

// tslint:disable:no-console

const extensions: IArgumentFiles[] = [
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
const cmd: ICommand = builder.createCommand(extensions);
console.log(inspect(cmd, { depth: 4 }));
cmd.prependArgument(`docker build . -f ${dockerFile} -t ${tag}`);
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
  builderOptions:
   { debug: false,
     dynamicVariables: { BUILD_DATE: [Function: BUILD_DATE] },
     logger: Logger {} },
  files:
   [ { patterns: [ 'examples/docker-build/labels.lbl' ],
       prefix: '--label' } ],
  arguments:
   [ CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.build-date=${BUILD_DATE}',
       argument: 'org.label-schema.build-date=2018-07-26' },
     CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.name=${NAME}',
       argument: 'org.label-schema.name=${NAME}' },
     CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.description=${DESCRIPTION}',
       argument: 'org.label-schema.description=${DESCRIPTION}' },
     CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.vcs-ref=${VCS_REF}',
       argument: 'org.label-schema.vcs-ref=${VCS_REF}' },
     CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.vendor=${VENDOR}',
       argument: 'org.label-schema.vendor=${VENDOR}' },
     CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.version=${VERSION}',
       argument: 'org.label-schema.version=${VERSION}' },
     CommandArgument {
       prefix: '--label',
       argumentBefore: 'org.label-schema.schema-version=${SCHEMA_VERSION}',
       argument: 'org.label-schema.schema-version=${SCHEMA_VERSION}' } ] }

*/
