# argster

A simple command/argument manager with a simple API that makes it easy to build dynamic commands and dynamic arguments with computed values.

## What

The [Builder's](#builder) builds and manages commands. When a new `Builder` instance is created, it provides an simple API to create and execute commands, append and prepend dynamic arguments.

When creating [commands](#command) through the builder, it goes through the list of file patterns recursively, reads each file, parses each line in the file, resolves dynamic variables to their values, and generates an executable command string. When a command is executed, it returns an object which contains both a _promise_ which is resolved or rejected based on how the process exits (0 / 1), along with a [Readable](https://nodejs.org/api/stream.html#stream_readable_streams) streams object for listening to stdout and stderr streams.

So instead of manually creating the following command in our CI pipeline, with dynamic arguments and dynamic values that need to be computed at runtime:

```bash
docker build . -t myimage:1.0.0 --label org.label-schema.build-date=2019-07-14 --label org.label-schema.name=argster-120-example --label org.label-schema.vendor=Vendor --label org.label-schema.version=1.0.0 --label org.label-schema.schema-version=1.0.0-rc.1
```

You could create a simple JavaScript script and create complex commands with dynamic arguments (evaluated JavaScript functions) and version control it all with Git.

### Example (docker build)

Pay special attention to the `org.label-schema.build-date` label with the dynamic date.

**1. If we created the following builder and command**

```typescript
const options = {
  dynamicVariables: {
    BUILD_DATE: () => new Date().toISOString().slice(0, 10),
    NAME: () => pkg.name,
    VERSION: () => pkg.version,
    DESCRIPTION: () => pkg.description,
    VENDOR: () => "Vendor",
    SCHEMA_VERSION: () => "1.0.0-rc.1"
  },
  skipUnresolvedVariables: true
};

const builder = new Builder(options);

const cmd = builder.createCommand('docker build .', [
  {
    patterns: ['**/*.lbl'],
    prefix: '--label'
  }
]);

cmd.prependArgument({
  argument: `myimage:${pkg.version}`,
  prefix: '-t'
});

command.exec();
```

**2. And had this pattern file**

**`./some/deep/path/file.lbl`**

```ini
org.label-schema.build-date=${BUILD_DATE}
org.label-schema.name=${NAME}
org.label-schema.description=${DESCRIPTION}
org.label-schema.vendor=${VENDOR}
org.label-schema.version=${VERSION}
org.label-schema.schema-version=${SCHEMA_VERSION}
```

**3. This will be the executed command:**

```bash
docker build . -t myimage:1.0.0 --label org.label-schema.build-date=2019-07-14 --label org.label-schema.name=argster-120-example --label org.label-schema.vendor=Vendor --label org.label-schema.version=1.0.0 --label org.label-schema.schema-version=1.0.0-rc.1
```

## Why

I always felt the lack of a tool/library to easily create dynamic commands with dynamic arguments that were derived by functions but had the possibility to version control, without creating complex shell scripts. It first started when I was experimenting with DevOps and started to work with Docker trying to create sane images. I started reading about best practices around labeling and tagging Docker images and stumbled up on [Label Schema](http://label-schema.org/rc1/#label-semantics).

I sat down and thought about the following technologies:

- Label Schema and label semantics for e.g. Docker images
- Dockerfile and `ENV` / `ARG`
- Dockerfile and `.env` file
- Power of JavaScript
- Power of variables
- Power of Git

With the great tech above I wanted to utilise it all and create a Node library that was able to build up complex dynamic command-line commands and arguments. Then the idea of **argster** was born.

Check out this [CodeSandbox](https://codesandbox.io/s/lyjjqzv38q) for examples.

Checkout the [roadmap](#roadmap) for what to come.

## Setup

You can install the npm package with yarn or npm:

### yarn

```bash
yarn add argster
```

### npm

```bash
npm install argster
```

## Concepts

### Builder

A builder is a core component that builds and manages commands.
The builder accepts [options](#options) to adjust how command arguments are parsed, etc.

### Command

A command is a string that is executed as a process. It contains a base command and arguments that can be assembled and manipulated.
When a command is created, it accepts file patterns as arguments, that are then processed, evaluated and converted to
a finalized command string, which is then executed.

#### File patterns

File patterns are structures that contain a prefix and a list of file patterns, where each file matching the pattern is
read and each line assembled into a command string, which is then executed.

**Example for `docker build`:**

```javascript
{
  prefix: '--build-arg',
  patterns: ['**/*.arg']
},
{
  prefix: '--label',
  patterns: ['**/*.lbl']
}
```

All files matching the glob pattern `**/*.arg` and `**/*.lbl` would be read and a command generated from those arguments.

When the command arguments are evaluated, a finalized command string is generated from those file contents.

### Builder Options

#### rootDir

Root directory to resolve all paths from.

##### Default

`process.cwd()`

#### dynamicVariables

Key-Value map containing the name of the variable and its value.

##### Possible values

 ```typescript
[key: string]: string | (() => string);
```

##### Example

```typescript
{
  BUILD_DATE: () => new Date().toISOString().slice(0, 10),
  VERSION: '1.0.0'
}
```

#### skip/warn/throw UnresolvedVariables

Handling of unresolved variables. These are the possible options:

- `skipUnresolvedVariables` (Default: `false`)
  - Skip command arguments where variables have no value
- `warnUnresolvedVariables` (Default: `true`)
  - Warn on command arguments where variables have no value
- `throwUnresolvedVariables` (Default: `false`)
  - Throw exception on command arguments where variables have no value

#### variablePattern

RegExp pattern for matching variables.

For example: `${SOME_VARIABLE}`

##### Default

`/\$\{(.+)\}/`

#### lineIgnorePattern

RegExp pattern for ignoring lines in files when generating arguments.

For example: `# Some comment` or `// Some comment`

##### Default

`/^(\#|\/{2,})/`

#### convertVariables

Convert variables based on format. An example would be to convert Windows environment variables to Linux or vice versa.

For example: `%FOO% -> $FOO`

##### Possible values

 ```typescript
false
  | [
      true,
      {
        from: RegExp;
        to: string;
      }
    ];
```

##### Example

```typescript
[true, { from: /\%([A-Z]+)\%/, to: '$$$1' }]
```

This would convert all Windows variables `%FOO%` to Linux variables `$FOO`

#### shell

Shell to use for executing commands

##### Default

`/bin/bash`

#### transformers

Transformer is an object which consists of two parts: `predicate` and `replacer`.

- `predicate` is a function that returns a boolean.
- `replacer` is a function that returns a new value.


##### Example

Here's a simple *transformer* that surrounds sentences in quotes.

```typescript
sentencesInQuotes: {
  predicate: (val: string): boolean => {
    if (!val) return false;
    return val.split(' ').length > 1;
  },
  replacer: (val: string): string => `"${val}"`
}
```

## API

### IBuilder

```typescript
options: IBuilderOptions;
/**
 * Create a new command and register it in the builder
 * @param command Main command, e.g. 'docker build'
 * @param filePatterns Command argument prefix and glob file patterns
 * @returns A new command object
 */
createCommand(
  command: string,
  filePatterns?: IArgumentFilePatterns[]
): ICommand;

/**
 * Get all commands that are registered in the builder
 * @returns Array of command objects
 */
getAllCommands(): ICommand[];
```

### ICommand

```typescript
/**
 * Executes a command
 * @param stdout Callback on STDOUT
 * @param stderr Callback on STDERR
 */
exec(
  stdout?: (chunk: string) => string,
  stderr?: (chunk: string) => string
): ICommandProcess;

/**
 * Prepend an argument
 * @param argument Argument
 */
prependArgument(argument: TCommandArgumentInput): ICommand;

/**
 * Append an argument
 * @param argument Argument
 */
appendArgument(argument: TCommandArgumentInput): ICommand;

/**
 * Get the command string
 */
toString(): string;

/**
 * Get the command string as an array
 */
toArray(): ReadonlyArray<string>;
```

## Roadmap

- Set up automated TypeScript documentation for APIs
- Follow [Conventional Commits](https://www.conventionalcommits.org)
- Set up CI to run automated tests
- Plugin / Middleware architecture
  - Ability to hook into events
  - Ability to add custom behavior with middlewares
  - Ability to create custom transformers
- CLI
- Optimizations + asynchronous operations
- Batch command handling
- Interactive process attaching, e.g. for `docker run -it`

## Contributing

All contributions are very well appreciated. Just fork this repo and [submit a PR](https://help.github.com/articles/about-pull-requests/)!

Just remember to run the following beforehand:

- `yarn test`
- `yarn typecheck`
- `yarn format`
- `yarn lint`
