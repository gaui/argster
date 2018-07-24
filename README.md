# argster

Just a simple command/argument manager with a simple API that makes it easy to build commands and arguments.

## Concepts

### Builder

A builder is a core component that manages commands that are then executed.
The builder accepts options for enabling debugging, logging and dynamic variables that are evaluated.

#### Dynamic variables

Dynamic variables are a key-value map that contain variables as keys, and map each key to a lambda function that returns a value.

**Example:**

```javascript
const dynamicVariables = {
  BUILD_DATE: () => new Date().toISOString().slice(0, 10)
};
```

All command arguments containing the variable `${BUILD_DATE}` would then be evaluated into the current date.

**Example:**

```javascript
> new Date().toISOString().slice(0, 10)
'2018-08-03'
```

### Command

A command is a string that is executed as a process. It contains arguments that can be assembled and manipulated.
When a command is created, it accepts file patterns as arguments, that are then processed, evaluated and converted to
a finalized command string, which is finally executed.

#### File patterns

File patterns are structures that contain a prefix and a list of file patterns, where each file matching the pattern is
read and each line assembled into a command string, which is then executed.

**Example:**

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

##### ./foo/file.arg

```ini
VAR1=VAL1
VAR2=VAL2
VAR3=VAL3
```

##### ./foo/bar/file.lbl

```ini
org.label-schema.build-date=${BUILD_DATE}
org.label-schema.name=MyProject
```

When the command arguments are evaluated, a finalized command is then generated from those arguments.

**Example:**

```bash
--build-arg VAR1=VAL1 --build-arg VAR2=VAL2 --build-arg VAR3=VAL3 --label org.label-schema.build-date=2018-08-03 --label org.label-schema.name=MyProject
```

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

## TODO

- Create tests
- Batch command handling
- Asynchronous operations
- Events

## Changelog

### 1.0.0

First release.
