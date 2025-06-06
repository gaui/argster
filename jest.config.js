// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: '.coverage',
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/__mocks__/'],
};
