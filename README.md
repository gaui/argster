# argster

Just a simple command/argument manager with a simple API that makes it easy to build commands and arguments.

## Usage

Check out the examples folder to see how this can be used.

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

```json
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

##### `./foo/file.arg`

```ini
VAR1=VAL1
VAR2=VAL2
VAR3=VAL3
```

##### `./foo/bar/file.lbl`

```ini
org.label-schema.build-date=${BUILD_DATE}
org.label-schema.name=MyProject
```

When the command arguments are evaluated, a finalized command is then generated from those arguments.

**Example:**

```bash
--build-arg VAR1=VAL1 --build-arg VAR2=VAL2 --build-arg VAR3=VAL3 --label org.label-schema.build-date=2018-08-03 --label org.label-schema.name=MyProject
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

### IBuilderOptions

```typescript
// Root dir to resolve all paths from
// default: process.cwd()
rootDir?: string;

// Key-Value map containing the name of the variable
// and its value (function/lambda)
dynamicVariables?: IDynamicVariables;

// Skip command arguments where variables have "no value" *
// default: false
skipUnresolvedVariables?: boolean;

// Warn on command arguments where variables have "no value" *
// default: true
warnUnresolvedVariables?: boolean;

// Automatically put single quotes around sentences
// default: true
sentencesInQuotes?: boolean;

// Pattern for matching variables
// default: \$\{(.+)\}
variablePattern?: RegExp;
```

**"no value" =** `null | undefined | ''`

### IDynamicVariables

```typescript
[key: string]: () => any;
```

#### Example

```typescript
{
  BUILD_DATE: () => new Date().toISOString().slice(0, 10),
  VERSION: () => '1.0.0'
}
```

## How it works

The [Builder's](#builder) responsibility is to build and manage commands. When a new `Builder` instance is created, it provides a API to create commands.

When creating [commands](#command) through the builder, it goes through the list of file patterns recursively, reads each file, parses each line in the file, resolves dynamic variables to their values, and generates a executable command string. When a command is executed, it returns an object which contains both a _promise_ which is resolved or rejected based on how the process exits, along with a [Readable](https://nodejs.org/api/stream.html#stream_readable_streams) streams object for listening to stdout and stderr streams.

## Roadmap

- Tests for core functionality
- Batch command handling
- Chaining of creating commands and arguments
- Optimizations + asynchronous operations
- Add various events useful for consumers
- Interactive process attaching, e.g. for `docker run -it`
- CLI

## Contributing

All contributions are very well appreciated. Just fork this repo and [submit a PR](https://help.github.com/articles/about-pull-requests/)!

Just remember to run the following beforehand:

- `yarn typecheck`
- `yarn format`
- `yarn lint`

## Changelog

### 1.1.3

- Upgraded to Babel 7 stable release
- Updated dependencies
- Added reference to git repo in package.json

### 1.1.2

- Added option for specifying which shell to use for executing commands. Default is `/bin/bash`

### 1.1.1

- Added support for class properties (Babel plugin)

### 1.1.0

- Babel 7
- Possibility to specify root dir for glob search patterns
- Bunch of refactoring

### 1.0.0

First release.
