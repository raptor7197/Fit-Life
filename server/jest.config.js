module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/services/notificationScheduler.js', // Exclude cron jobs from coverage
  ],
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Timeout for async operations (database operations can be slow)
  testTimeout: 30000,
  
  // Verbose output to see individual test results
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Global teardown and setup (disabled for now)
  // globalSetup: '<rootDir>/tests/globalSetup.js',
  // globalTeardown: '<rootDir>/tests/globalTeardown.js',
  
  // Transform ES6 modules (disabled for now)
  // transform: {
  //   '^.+\\.js$': 'babel-jest'
  // },
  
  // Ignore certain modules from transformation
  transformIgnorePatterns: [
    'node_modules/(?!(@jest/transform|@babel/runtime)/)'
  ],
  
  // Enable fake timers for testing scheduled operations
  fakeTimers: {
    enableGlobally: false
  }
};