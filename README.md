# argster

A simple command/argument manager with a simple API that makes it easy to build commands and arguments.

## Examples

Check out this [CodeSandbox](https://codesandbox.io/s/lyjjqzv38q).

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

To explain...

#### 1. If we created the following builder/command

```typescript
const extensions = [
  {
    prefix: '--build-arg',
    patterns: ['**/*.arg']
  },
  {
    prefix: '--label',
    patterns: ['**/*.lbl']
  }
];

const options = {
  dynamicVariables: {
    BUILD_DATE: () => new Date().toISOString().slice(0, 10)
  }
};

const builder = new Builder(options);
const command = builder.createCommand('docker build .', extensions);
command.exec();
```

#### 2. And had these pattern files

**`./foo/file.arg`**

```ini
VAR1=VAL1
VAR2=VAL2
VAR3=VAL3
```

**`./foo/bar/file.lbl`**

```ini
org.label-schema.build-date=${BUILD_DATE}
org.label-schema.name=MyProject
```

#### 3. This would be the generated command that would be executed


```bash
docker build . --build-arg VAR1=VAL1 --build-arg VAR2=VAL2 --build-arg VAR3=VAL3 --label org.label-schema.build-date=2018-08-03 --label org.label-schema.name=MyProject
```

Take a look at how the `${BUILD_DATE}` argument now has the actual date. This is based on the dynamic variable we specified in the builder options above.

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

## How it works

The [Builder's](#builder) responsibility is to build and manage commands. When a new `Builder` instance is created, it provides a API to create commands.

When creating [commands](#command) through the builder, it goes through the list of file patterns recursively, reads each file, parses each line in the file, resolves dynamic variables to their values, and generates a executable command string. When a command is executed, it returns an object which contains both a _promise_ which is resolved or rejected based on how the process exits, along with a [Readable](https://nodejs.org/api/stream.html#stream_readable_streams) streams object for listening to stdout and stderr streams.

## Roadmap

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

## Changelog

### 1.2.3

- **chore:** Pin all dependencies to fixed SemVer.
- **chore:** Upgrade various dependencies to latest version, e.g. Babel, TypeScript + Jest

### 1.2.2

- **fix:** Wrong import for `glob` module.

### 1.2.1

- **feat:** Added the option to convert platform specific variables with the [`convertVariables` option](#convertVariables).
- **feat:** Added the option to ignore lines based on a RegExp pattern with the [`lineIgnorePattern` option](#lineIgnorePattern), e.g. comment lines starting with `#` or `//`
- **feat:** Dynamic Variables can now be [primitive values instead of only functions](#dynamicVariables).
- **feat:** Now possible to chain `prependArgument()` and `appendArgument()` functions on  `ICommand`.
- **feat:** New option `throwUnresolvedVariables` that throws an exception and stops the process when handling variables that cannot be resolved.
- **fix:** Empty arguments resulted in the string `undefined`.
- **chore:** Unit tests for all core functionality.
- **chore:** Moved examples to CodeSandbox.
- **chore:** Use Ramda.
- **chore:** Use microbundle for bundling and distribution.
- **chore:** Migrate from TSLint to ESLint

### 1.1.4

- Added possibility to specify stdout/stderr callbacks when executing a command (in `exec()` function).
- Added stdout/stderr output when promise for process is resolved.
- Only use `close` event (instead of both `close` and `exit`) in ChildProcess to determine status of process.

### 1.1.3

- Upgraded to Babel 7 stable release.
- Updated dependencies.
- Added reference to git repo in package.json.

### 1.1.2

- Added option for specifying which shell to use for executing commands. Default is `/bin/bash`

### 1.1.1

- Added support for class properties (Babel plugin).

### 1.1.0

- Babel 7.
- Possibility to specify root dir for glob search patterns.
- Bunch of refactoring.

### 1.0.0

First release.
