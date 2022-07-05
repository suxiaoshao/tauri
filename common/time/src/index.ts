import sourceDayjs, { Dayjs as SourceDayjs } from 'dayjs';
import 'dayjs/locale/zh-cn'; // 导入本地化语言
sourceDayjs.locale('zh-cn'); // 使用本地化语言
export const dayjs = sourceDayjs;
export * from './format';
export type Dayjs = SourceDayjs;
