import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./config/test/testSetup.ts'],
    coverage: {
      reporter: ['text'],
      provider: 'c8',
    },
  },
});
