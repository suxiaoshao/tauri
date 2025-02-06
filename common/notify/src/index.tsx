/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-08-09 16:54:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:38:37
 * @FilePath: /tauri/common/notify/src/index.tsx
 */
import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { type OptionsObject, SnackbarProvider as SourceSnackbarProvider, useSnackbar } from 'notistack';
import { type JSX, type ReactNode, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';

export type SnackbarData = [string, OptionsObject?];
const snackbarSubject = new Subject<SnackbarData>();
export async function enqueueSnackbar(...data: SnackbarData) {
  snackbarSubject.next(data);
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification(data[0]);
  }
}
function useSnackbarInit() {
  const { enqueueSnackbar: open } = useSnackbar();
  useEffect(() => {
    const key = snackbarSubject.subscribe((data) => {
      open(...data);
    });
    return () => {
      key.unsubscribe();
    };
  }, [open]);
}
export function SnackbarProvider({ children }: { children: ReactNode }): JSX.Element {
  const ref = useRef<SourceSnackbarProvider>(null);
  function InnerUseComponent() {
    useSnackbarInit();
    return children;
  }
  return (
    <SourceSnackbarProvider
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      maxSnack={5}
      ref={ref}
      action={(key) => (
        <IconButton
          onClick={() => {
            ref.current?.closeSnackbar(key);
          }}
        >
          <Close sx={{ color: '#fff' }} />
        </IconButton>
      )}
      variant="error"
    >
      <InnerUseComponent />
    </SourceSnackbarProvider>
  );
}
