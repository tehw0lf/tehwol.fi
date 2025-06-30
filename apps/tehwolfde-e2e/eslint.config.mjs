import { dirname } from 'path';
import { fileURLToPath } from 'url';
import baseConfig from '../../eslint.config.mjs';

// Note: FlatCompat and js are available if needed for future config extensions
const __dirname = dirname(fileURLToPath(import.meta.url));
void __dirname; // Mark as used to avoid lint warnings

export default [
  {
    ignores: ['**/dist']
  },
  ...baseConfig,
  // Playwright doesn't require specific eslint plugins
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
];
