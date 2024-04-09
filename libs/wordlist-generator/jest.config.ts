import { swcAngularJestTransformer } from '@jscutlery/swc-angular-preset';

/* eslint-disable */
export default {
  displayName: 'wordlist-generator',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
  coverageDirectory: '../../coverage/libs/wordlist-generator',
  transform: {
    '^.+\\.(ts|mjs|js)$': swcAngularJestTransformer(),
    '^.+\\.(html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ]
};
