import { invoke } from '@tauri-apps/api';
import { useEffect } from 'react';
import usePlatform from './usePlatform';

export default function useSettingKey() {
  const platform = usePlatform();
  useEffect(() => {
    const handleShortcut = async (event: KeyboardEvent) => {
      const isMacos = platform === 'Darwin';
      if (((event.metaKey && isMacos) || (event.ctrlKey && !isMacos)) && event.key === ',') {
        await invoke('plugin:config|create_setting_window');
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => {
      document.removeEventListener('keydown', handleShortcut);
    };
  }, [platform]);
}
