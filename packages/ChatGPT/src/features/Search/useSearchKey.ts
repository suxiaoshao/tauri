import usePlatform from '@chatgpt/hooks/usePlatform';
import { useEffect, useEffectEvent } from 'react';

export default function useSearchKey(toggle: () => void) {
  const platform = usePlatform();
  const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
    const isMacos = platform === 'macos';
    if (((event.metaKey && isMacos) || (event.ctrlKey && !isMacos)) && event.key === 'f') {
      toggle();
    }
  });
  useEffect(() => {
    const abortController = new AbortController();
    document.addEventListener('keydown', handleShortcut, { signal: abortController.signal });
    return () => {
      abortController.abort();
    };
  }, []);
}
