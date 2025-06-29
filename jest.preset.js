const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  // Performance optimizations
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Global optimizations
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/test-setup.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.stories.ts'
  ],
  
  // Faster test execution
  testTimeout: 10000,
  
  // Memory optimization
  workerIdleMemoryLimit: '512MB',
  
  // Coverage configuration
  coverageReporters: ['text-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 60,
      statements: 60
    }
  }
};
