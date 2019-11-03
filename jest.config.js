module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 80,
      lines: 75,
      functions: 80,
    },
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,js}'],
};
