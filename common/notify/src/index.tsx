/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-08-09 16:54:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:38:37
 * @FilePath: /tauri/common/notify/src/index.tsx
 */
import { Toaster } from '@chatgpt/components/ui/sonner';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { type ReactNode } from 'react';
import { toast } from 'sonner';

export type SnackbarData = [string];
export async function enqueueSnackbar(...data: SnackbarData) {
  toast(...data);
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification(data[0]);
  }
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
