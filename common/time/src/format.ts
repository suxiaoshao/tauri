/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 02:20:58
 * @FilePath: /tauri/common/time/src/format.ts
 */
import { type ConfigType } from 'dayjs';
import { dayjs } from './init';

/** 格式化时间 */
export function format(timestamp?: ConfigType): string {
  if (timestamp === null || timestamp === undefined) {
    return '~';
  }
  const time = dayjs(timestamp);

  return time.format('YYYY-M-D HH:mm:ss');
}
