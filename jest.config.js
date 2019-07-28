module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(lodash-es)/)'
  ],
  testPathIgnorePatterns: [
    "<rootDir>/dist/", "<rootDir>/node_modules/"
  ]
};
