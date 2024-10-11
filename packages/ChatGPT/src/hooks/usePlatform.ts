import { type OsType, type } from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';

export default function usePlatform() {
  const [platform, setPlatform] = useState<OsType | null>(null);
  useEffect(() => {
    (async () => {
      setPlatform(await type());
    })();
  }, []);
  return platform;
}
