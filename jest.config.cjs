module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svg.ts',
    '\\.css$': 'identity-obj-proxy',
  }
}
