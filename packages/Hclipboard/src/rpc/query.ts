import { invoke } from '@tauri-apps/api';
import { InvokeArgs } from '@tauri-apps/api/tauri';

export interface QueryHistoryRequest {
  searchName?: string | null;
}

export interface ClipHistory {
  data: string;
  updateTime: number;
  id: number;
}

export type QueryHistoryResponse = ClipHistory[];

export async function query(data: QueryHistoryRequest): Promise<QueryHistoryResponse> {
  return await invoke('plugin:clipboard|query_history', data as InvokeArgs);
}
