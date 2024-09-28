import usePlatform from '@chatgpt/hooks/usePlatform';
import { deleteTemporaryConversation } from '@chatgpt/service/temporaryConversation';
import { appWindow } from '@tauri-apps/api/window';
import { useHotkeys } from 'react-hotkeys-hook';
import { Outlet, useSearchParams } from 'react-router-dom';
import { match, P } from 'ts-pattern';

export default function Temporary() {
  const platform = usePlatform();
  const [searchParams] = useSearchParams();
  const persistentId = match(searchParams.get('persistentId'))
    .with(P.nonNullable, (id) =>
      match(Number.parseInt(id, 10))
        .with(Number.NaN, () => null)
        .otherwise((id) => id),
    )
    .otherwise(() => null);
  useHotkeys(
    match(platform)
      .with('Darwin', () => ['Meta+q', 'Meta+w'])
      .otherwise(() => ['Control+q', 'Control+w']),
    (event) => {
      event.preventDefault();
      appWindow.close();
      deleteTemporaryConversation({ persistentId });
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform, persistentId],
  );
  return <Outlet />;
}
