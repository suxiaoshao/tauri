/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 22:41:58
 * @FilePath: /tauri/packages/ChatGPT/src/hooks/usePromise.ts
 */
import { Enum } from 'types';
import { useCallback, useEffect, useState } from 'react';

export type PromiseData<T> = Enum<'data', T> | Enum<'error', Error> | Enum<'loading'> | Enum<'init'>;

export default function usePromise<T>(fn: () => Promise<T>, autoRun: boolean = true): [PromiseData<T>, () => void] {
  const [state, setState] = useState<PromiseData<T>>({ tag: 'init' });
  const func = useCallback(() => {
    setState({ tag: 'loading' });
    fn()
      .then((data) => setState({ tag: 'data', value: data } as PromiseData<T>))
      .catch((error) => setState({ tag: 'error', value: error }));
  }, [fn]);
  useEffect(() => {
    if (autoRun) {
      func();
    }
  }, [func, autoRun]);
  return [state, func];
}
