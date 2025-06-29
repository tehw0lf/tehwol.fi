import { swcAngularJestTransformer } from '@jscutlery/swc-angular';

export interface JestConfigOptions {
  displayName: string;
  coverageDirectory: string;
  rootDir?: string;
}

export const createJestConfig = ({ displayName, coverageDirectory, rootDir = '.' }: JestConfigOptions) => ({
  displayName,
  preset: `${rootDir}/jest.preset.js`,
  setupFilesAfterEnv: [`<rootDir>/src/test-setup.ts`],
  globals: {},
  coverageDirectory,
  
  // Optimized transforms using SWC
  transform: {
    '^.+\\.(ts|mjs|js)$': swcAngularJestTransformer({
      swcrc: false,
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true
        },
        transform: {
          decoratorMetadata: true
        },
        target: 'es2020'
      }
    }),
    '^.+\\.(html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@primer|cartesian-product-generator)'
  ],
  
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|ts)',
    '<rootDir>/src/**/+(*.)+(spec|test).+(js|ts)'
  ],

  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/test-setup.ts'
  ]
});