// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // A set of global variables that need to be available in all test environments
  globals: {
    'babel-jest': {
      babelrcFile: '.babelrc'
    }
  },

  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'tsx', 'js'],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)'],

  testPathIgnorePatterns: ['/node_modules/', '/__mocks__/'],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};
