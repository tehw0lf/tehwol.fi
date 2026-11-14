import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['**/dist']
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      // Specs must use the shared fixture, which fails on console errors.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['test', 'expect'],
              allowTypeImports: true,
              message:
                "Import `test` and `expect` from './fixtures' so that console and page errors fail the test."
            }
          ]
        }
      ]
    }
  }
];
