import { useSnackbar } from 'notistack';
import { render, waitFor, screen, cleanup } from '@testing-library/react';
import { enqueueSnackbar, SnackbarProvider } from '.';
import { afterEach, expect, describe, it } from 'vitest';

describe('notify', () => {
  afterEach(() => {
    cleanup();
  });
  it('use enqueueSnackbar fn', async () => {
    render(<SnackbarProvider>111</SnackbarProvider>);
    expect(screen.getByText('111')).toBeTruthy();
    await waitFor(() => enqueueSnackbar('test'));
    expect(screen.getByText('test')).toBeTruthy();
  });
  it('use hooks', async () => {
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
