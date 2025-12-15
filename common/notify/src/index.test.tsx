/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-07-21 16:40:37
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:51:35
 * @FilePath: /tauri/common/notify/src/index.test.tsx
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { enqueueSnackbar, SnackbarProvider } from '.';
import { mockIPC } from '@tauri-apps/api/mocks';

describe('notify', () => {
  afterEach(() => {
    cleanup();
  });
  it('use enqueueSnackbar fn', async () => {
    mockIPC((cmd, _args) => {
      // oxlint-disable-next-line no-conditional-in-test
      if (cmd === 'plugin:notification|is_permission_granted') {
        return true;
      }
    });
    // mock 实现
    const mockMQL = {
      matches: true,
      media: '(max-width: 600px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    // @ts-expect-error mock
    // oxlint-disable-next-line prefer-spy-on
    window.matchMedia = jest.fn().mockReturnValue(mockMQL);
    class Notification {
      static permission = 'default';
      //oxlint-disable-next-line no-useless-constructor no-empty-function
      constructor() {}
    }
    // @ts-expect-error next-line
    window.Notification = Notification;
    render(<SnackbarProvider>111</SnackbarProvider>);
    expect(screen.getByText('111')).toBeTruthy();
    await waitFor(async () => await enqueueSnackbar('test'));
    expect(screen.getByText('test')).toBeTruthy();
  });
});
