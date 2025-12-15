import { invoke, type InvokeArgs } from '@tauri-apps/api/core';

export interface AppPath {
  desc: string | null;
  icon: string | null;
  path: string;
  name: string;
}

export interface QueryAppsRequest {
  path: string;
}

export async function queryApps(query: QueryAppsRequest) {
  const data: AppPath[] = await invoke('app_search', { path: query.path } as InvokeArgs);
  return data;
}
