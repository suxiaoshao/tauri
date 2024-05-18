import usePlatform from '@chatgpt/hooks/usePlatform';
import { appWindow } from '@tauri-apps/api/window';
import { useHotkeys } from 'react-hotkeys-hook';
import { Outlet } from 'react-router-dom';

export default function Temporary() {
  const platform = usePlatform();
  useHotkeys(
    platform === 'Darwin' ? ['Meta+q', 'Meta+w'] : ['Control+q', 'Control+w'],
    (event) => {
      event.preventDefault();
      appWindow.close();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform],
  );
  return <Outlet />;
}
