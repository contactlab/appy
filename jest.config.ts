import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
  automock: false,
  bail: true,
  clearMocks: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/test/_setup.ts',
    '<rootDir>/node_modules/'
  ],
  coverageReporters: ['text'],
  maxWorkers: '50%',
  moduleFileExtensions: ['js', 'json', 'node', 'ts'],
  preset: 'ts-jest',
  roots: ['<rootDir>/test/'],
  setupFiles: ['<rootDir>/test/_setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: undefined,
  testRegex: '(\\.|/)spec\\.ts$',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: true,
        isolatedModules: true
      }
    ]
  }
};

export default config;
