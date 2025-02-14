import { swcAngularJestTransformer } from '@jscutlery/swc-angular';

export default {
  displayName: 'contact-form',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: [
    '<rootDir>/setup-jest.ts',
    '<rootDir>/src/test-setup.ts'
  ],
  globals: {},
  coverageDirectory: '../../coverage/libs/contact-form',
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
