import { OsType, type } from '@tauri-apps/api/os';
import { useEffect, useState } from 'react';

export default function usePlatform() {
  const [platform, setPlatform] = useState<OsType | null>(null);
  useEffect(() => {
    type().then(setPlatform);
  }, []);
  return platform;
}
