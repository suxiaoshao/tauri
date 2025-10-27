import { type InvokeArgs, invoke } from '@tauri-apps/api/core';

export interface QueryHistoryRequest {
  searchName?: string | null;
}

export async function query(data: QueryHistoryRequest): Promise<ArrayBuffer> {
  return await invoke('plugin:clipboard|query_history', data as InvokeArgs);
}

export async function copyToClipboard(id: number): Promise<void> {
  await invoke('plugin:clipboard|copy_to_clipboard', { id } as InvokeArgs);
}
