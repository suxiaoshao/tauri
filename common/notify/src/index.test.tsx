/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-07-21 16:40:37
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:51:35
 * @FilePath: /tauri/common/notify/src/index.test.tsx
 */
import { useSnackbar } from 'notistack';
import { render, waitFor, screen, cleanup } from '@testing-library/react';
import { enqueueSnackbar, SnackbarProvider } from '.';
import { afterEach, expect, describe, it } from 'vitest';
import { mockIPC } from '@tauri-apps/api/mocks';

describe('notify', () => {
  afterEach(() => {
    cleanup();
  });
  it('use enqueueSnackbar fn', async () => {
    mockIPC(async () => {
      render(<SnackbarProvider>111</SnackbarProvider>);
      expect(screen.getByText('111')).toBeTruthy();
      await waitFor(async () => await enqueueSnackbar('test'));
      expect(screen.getByText('test')).toBeTruthy();
    });
  });
  it('use hooks', async () => {
    mockIPC(async () => {
      function Test() {
        const snackbar = useSnackbar();
        return (
          <div>
            <button onClick={() => snackbar.enqueueSnackbar('test click')}>test</button>
          </div>
        );
      }
      render(
        <SnackbarProvider>
          <Test />
        </SnackbarProvider>,
      );
      expect(screen.getByText('test')).toBeTruthy();
      await waitFor(() => screen.getByText('test').click());
      expect(screen.getByText('test click')).toBeTruthy();
      expect(screen.getByText('test click')).toBeTruthy();
    });
  });
});
