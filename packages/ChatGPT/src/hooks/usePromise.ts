import { Enum } from 'types';
import { useEffect, useState } from 'react';

export type PromiseData<T> = Enum<'data', T> | Enum<'error', Error> | Enum<'loading'> | Enum<'init'>;

export default function usePromise<T>(fn: () => Promise<T>): PromiseData<T> {
  const [state, setState] = useState<PromiseData<T>>({ tag: 'init' });
  useEffect(() => {
    setState({ tag: 'loading' });
    fn()
      .then((data) => setState({ tag: 'data', value: data } as PromiseData<T>))
      .catch((error) => setState({ tag: 'error', value: error }));
  }, [fn]);
  return state;
}
