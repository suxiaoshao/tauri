import { platform } from '@chatgpt/const/platform';
import { invoke } from '@tauri-apps/api';
import { useEffect } from 'react';

export default function useSettingKey() {
  useEffect(() => {
    const handleShortcut = async (event: KeyboardEvent) => {
      const isMacos = platform === 'Darwin';
      if (((event.metaKey && isMacos) || (event.ctrlKey && !isMacos)) && event.key === ',') {
        invoke('plugin:config|create_setting_window');
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => {
      document.removeEventListener('keydown', handleShortcut);
    };
  }, []);
}
