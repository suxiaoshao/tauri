import { createSettingWindow } from '@chatgpt/service/config';
import { useEffect } from 'react';
import usePlatform from './usePlatform';

export default function useSettingKey() {
  const platform = usePlatform();
  useEffect(() => {
    const handleShortcut = async (event: KeyboardEvent) => {
      const isMacos = platform === 'Darwin';
      if (((event.metaKey && isMacos) || (event.ctrlKey && !isMacos)) && event.key === ',') {
        await createSettingWindow();
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => {
      document.removeEventListener('keydown', handleShortcut);
    };
  }, [platform]);
}
