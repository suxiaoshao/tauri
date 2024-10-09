/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-07-21 16:40:37
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:51:35
 * @FilePath: /tauri/common/notify/src/index.test.tsx
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useSnackbar } from 'notistack';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { enqueueSnackbar, SnackbarProvider } from '.';

vi.mock(import('@tauri-apps/plugin-notification'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    isPermissionGranted: vi.fn().mockReturnValue(true),
    sendNotification: vi.fn(),
  };
});

describe('notify', () => {
  afterEach(() => {
    cleanup();
  });
  it('use enqueueSnackbar fn', async () => {
    render(<SnackbarProvider>111</SnackbarProvider>);
    expect(screen.getByText('111')).toBeTruthy();
    await waitFor(async () => await enqueueSnackbar('test'));
    expect(screen.getByText('test')).toBeTruthy();
  });
  it('use hooks', async () => {
    function Test() {
      const snackbar = useSnackbar();
      return (
        <div>
          <button type="button" onClick={() => snackbar.enqueueSnackbar('test click')}>
            test
          </button>
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
