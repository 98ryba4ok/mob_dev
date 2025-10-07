module.exports = {
  testTimeout: 120000,
  testRunner: 'jest-circus/runner',
  testMatch: ['**/?(*.)+(e2e).[jt]s?(x)'],
  setupFilesAfterEnv: ['./setup.e2e.js']
};


