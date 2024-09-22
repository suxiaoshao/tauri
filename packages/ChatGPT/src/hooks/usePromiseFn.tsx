import { useCallback, useState } from 'react';
import { PromiseData, PromiseStatus } from './usePromise';

// eslint-disable-next-line no-explicit-any
export default function usePromiseFn<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
): [PromiseData<T>, (...args: Args) => Promise<T>] {
  const [state, setState] = useState<PromiseData<T>>({ tag: PromiseStatus.init });
  const func = useCallback(
    async (...args: Args) => {
      setState({ tag: PromiseStatus.loading });
      try {
        const data = await fn(...args);
        setState({ tag: PromiseStatus.data, value: data } as PromiseData<T>);
        return data;
      } catch (error) {
        if (error instanceof Error) {
          setState({ tag: PromiseStatus.error, value: error });
          throw error;
        }
        const err = new Error(`unknow error: ${error}`);
        setState({ tag: PromiseStatus.error, value: err });
        throw err;
      }
    },
    [fn],
  );
  return [state, func];
}
