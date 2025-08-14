import usePlatform from '@chatgpt/hooks/usePlatform';
import { useEffect } from 'react';

export default function useSearchKey(setOpen: () => void) {
  const platform = usePlatform();
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isMacos = platform === 'macos';
      if (((event.metaKey && isMacos) || (event.ctrlKey && !isMacos)) && event.key === 'f') {
        setOpen();
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [setOpen, platform]);
}
