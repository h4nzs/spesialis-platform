import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['src/test-integration-setup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    pool: 'forks',
    // @ts-expect-error - singleFork is valid for vitest/forks pool but not yet in types
    singleFork: true,
  },
});
