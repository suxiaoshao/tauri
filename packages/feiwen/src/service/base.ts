/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-17 16:42:49
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:31:24
 * @FilePath: /tauri/packages/feiwen/src/service/base.ts
 */
import { invoke } from '@tauri-apps/api';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { enqueueSnackbar } from 'notify';

export async function appInvoke<P, R>(cmd: string, params: P): Promise<R> {
  try {
    const response = await invoke<R>(cmd, params as InvokeArgs);
    return response;
  } catch (e) {
    if (e instanceof Error) {
      await enqueueSnackbar(e.message, { variant: 'error' });
    } else if (typeof e === 'string') {
      await enqueueSnackbar(e, { variant: 'error' });
    } else {
      await enqueueSnackbar('unknown error', { variant: 'error' });
    }
    console.error(e);
    throw e;
  }
}
