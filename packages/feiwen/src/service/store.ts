import { FetchParams } from '../page/Fetch';
import { appInvoke } from './base';

export async function fetchData(params: FetchParams) {
  await appInvoke<FetchParams, unknown>('plugin:store|fetch', params);
}
