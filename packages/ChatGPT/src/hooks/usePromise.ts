/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 22:41:58
 * @FilePath: /tauri/packages/ChatGPT/src/hooks/usePromise.ts
 */
import { Enum } from 'types';
import { useCallback, useEffect, useState } from 'react';

export enum PromiseStatus {
  data = 'data',
  error = 'error',
  loading = 'loading',
  init = 'init',
}

export type PromiseData<T> =
  | Enum<PromiseStatus.data, T>
  | Enum<PromiseStatus.error, Error>
  | Enum<PromiseStatus.loading>
  | Enum<PromiseStatus.init>;

export default function usePromise<T>(fn: () => Promise<T>, autoRun: boolean = true): [PromiseData<T>, () => void] {
  const [state, setState] = useState<PromiseData<T>>({ tag: PromiseStatus.init });
  const func = useCallback(() => {
    setState({ tag: PromiseStatus.loading });
    fn()
      .then((data) => setState({ tag: PromiseStatus.data, value: data } as PromiseData<T>))
      .catch((error) => setState({ tag: PromiseStatus.error, value: error }));
  }, [fn]);
  useEffect(() => {
    if (autoRun) {
      func();
    }
  }, [func, autoRun]);
  return [state, func];
}
