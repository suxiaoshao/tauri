import { invoke } from '@tauri-apps/api';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { enqueueSnackbar } from 'notify';

export async function appInvoke<P, R>(cmd: string, params: P): Promise<R> {
  try {
    const response = await invoke<R>(cmd, params as InvokeArgs);
    return response;
  } catch (e) {
    if (e instanceof Error) {
      enqueueSnackbar(e.message, { variant: 'error' });
    } else if (typeof e === 'string') {
      enqueueSnackbar(e, { variant: 'error' });
    } else {
      enqueueSnackbar('unknown error', { variant: 'error' });
    }
    console.error(e);
    throw e;
  }
}
