import { type Options, isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';

export default async function notification(options: Options | string) {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification(options);
  }
}
