import usePlatform from '@chatgpt/hooks/usePlatform';
import { appWindow } from '@tauri-apps/api/window';
import { useHotkeys } from 'react-hotkeys-hook';
import { Outlet } from 'react-router-dom';
import { match } from 'ts-pattern';

export default function Temporary() {
  const platform = usePlatform();
  useHotkeys(
    match(platform)
      .with('Darwin', () => ['Meta+q', 'Meta+w'])
      .otherwise(() => ['Control+q', 'Control+w']),
    (event) => {
      event.preventDefault();
      appWindow.close();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform],
  );
  useHotkeys(
    match(platform)
      .with('Darwin', () => ['Meta+h'])
      .otherwise(() => ['Control+h']),
    (event) => {
      event.preventDefault();
      appWindow.hide();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform],
  );
  return <Outlet />;
}
