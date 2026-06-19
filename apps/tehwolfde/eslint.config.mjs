import nxEslintPlugin from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['**/dist']
  },
  ...baseConfig,
  ...nxEslintPlugin.configs['flat/angular'].map((config) => ({
    ...config,
    files: ['**/*.ts'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: undefined
      }
    },
    rules: {
      ...config.rules,
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'tehw0lf',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'tehw0lf',
          style: 'kebab-case'
        }
      ]
    }
  })),
  ...nxEslintPlugin.configs['flat/angular-template'].map((config) => ({
    ...config,
    files: ['**/*.html'],
    rules: {
      ...config.rules
    }
  })),
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
      // Newly enabled by angular-eslint tsRecommended in the flat config migration; was not enforced before the upgrade.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off'
    }
  }
];
