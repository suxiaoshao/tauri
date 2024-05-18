import { useCallback, useState } from 'react';
import { PromiseData, PromiseStatus } from './usePromise';

export default function usePromiseFn<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
): [PromiseData<T>, (...args: Args) => Promise<T>] {
  const [state, setState] = useState<PromiseData<T>>({ tag: PromiseStatus.init });
  const func = useCallback(
    async (...args: Args) => {
      setState({ tag: PromiseStatus.loading });
      return fn(...args)
        .then((data) => {
          setState({ tag: PromiseStatus.data, value: data } as PromiseData<T>);
          return data;
        })
        .catch((error) => {
          setState({ tag: PromiseStatus.error, value: error });
          throw error;
        });
    },
    [fn],
  );
  return [state, func];
}
