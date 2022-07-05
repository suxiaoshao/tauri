import { dayjs } from './index';

/** 格式化时间 */
export function format(timestamp?: number): string {
  if (timestamp == null || timestamp == undefined) {
    return '~';
  }
  const time = dayjs(timestamp);

  return time.format('YYYY-M-D HH:mm:ss');
}
