import type { Config } from 'jest';
import type { Config as SwcConfig } from '@swc/core';

const config: Config = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      } satisfies SwcConfig,
    ],
  },
  setupFilesAfterEnv: ['./config/test/testSetup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironment: 'jsdom',
};

export default config;
