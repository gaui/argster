// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testEnvironment: 'node',

  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  coverageDirectory: '.coverage',
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/__mocks__/']
};
