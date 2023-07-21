import marchers from '@testing-library/jest-dom/matchers';
import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(marchers);

/// <reference types="vitest/globals" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface JestAssertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
  }
}
