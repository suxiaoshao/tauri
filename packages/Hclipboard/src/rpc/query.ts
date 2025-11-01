import { type InvokeArgs, invoke } from '@tauri-apps/api/core';
import { enum_, type InferInput, object, optional, string } from 'valibot';

export enum ClipboardType {
  Text = 'Text',
  Image = 'Image',
  Html = 'Html',
  Rtf = 'Rtf',
  Files = 'Files',
}

export const queryRequestSchema = object({
  searchName: optional(string()),
  clipboardType: optional(enum_(ClipboardType)),
});

export type QueryHistoryRequest = InferInput<typeof queryRequestSchema>;

export async function query(data: QueryHistoryRequest): Promise<ArrayBuffer> {
  return await invoke('plugin:clipboard|query_history', data as InvokeArgs);
}

export async function copyToClipboard(id: number): Promise<void> {
  await invoke('plugin:clipboard|copy_to_clipboard', { id } as InvokeArgs);
}
