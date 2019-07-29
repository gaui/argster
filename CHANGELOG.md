# Changelog

## 1.3.1

Just a minor update to address a [security vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2019-1010266) in lodash. Along with updating some dependencies.

- **chore:** Update Node to v12.7.0
- **chore:** Update ESLint to v6.1.0
- **chore:** Update Babel to v7.5.5
- **chore:** Update lodash from 4.17.10 to 4.17.15 because of a [security vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2019-1010266).

## 1.3.0

- **refactor:** Use `.d.ts` files instead of exporting/importing types/interfaces.
- **fix:** Fixed `toArray()` for commands with arguments and added tests.
- **docs:** Moved changelog from `README.md` to `CHANGELOG.md`.
- **chore:** Added Renovate to manage dependencies.
- **chore:** Pin all dependencies to fixed SemVer.
- **chore:** Node v8 support bumped to v10 (LTS).
- **chore:** Pin Node development to `12.4.0` (`engines:node` restriction + `.nvmrc` file).
- **chore:** Upgrade various dependencies to latest version, e.g. Babel, TypeScript + Jest.
- **chore:** Added `yarn audit` npm script to manage vulnerabilities in package dependencies.
- **chore:** Utilise Jest test coverage feature, to use in CI.
- **chore:** Use [@pika/pack](https://github.com/pikapkg/pack) for bundling and distributing the library.

## 1.2.2

- **fix:** Wrong import for `glob` module.

## 1.2.1

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

## 1.1.4

- Added possibility to specify stdout/stderr callbacks when executing a command (in `exec()` function).
- Added stdout/stderr output when promise for process is resolved.
- Only use `close` event (instead of both `close` and `exit`) in ChildProcess to determine status of process.

## 1.1.3

- Upgraded to Babel 7 stable release.
- Updated dependencies.
- Added reference to git repo in package.json.

## 1.1.2

- Added option for specifying which shell to use for executing commands. Default is `/bin/bash`

## 1.1.1

- Added support for class properties (Babel plugin).

## 1.1.0

- Babel 7.
- Possibility to specify root dir for glob search patterns.
- Bunch of refactoring.

## 1.0.0

First release.
