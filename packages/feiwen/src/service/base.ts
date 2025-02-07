/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-17 16:42:49
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:31:24
 * @FilePath: /tauri/packages/feiwen/src/service/base.ts
 */
import { type InvokeArgs, invoke } from '@tauri-apps/api/core';
import { enqueueSnackbar } from 'notify';

export async function appInvoke<P, R>(cmd: string, params: P): Promise<R> {
  try {
    const response = await invoke<R>(cmd, params as InvokeArgs);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      await enqueueSnackbar(error.message, { variant: 'error' });
    } else if (typeof error === 'string') {
      await enqueueSnackbar(error, { variant: 'error' });
    } else {
      await enqueueSnackbar('unknown error', { variant: 'error' });
    }
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }
}
