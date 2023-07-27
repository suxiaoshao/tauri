import { OsType, type } from '@tauri-apps/api/os';
export let platform: OsType | null = null;

type().then((value) => {
  platform = value;
});
