import { Tag } from '@feiwen/types/tag';
import { FetchParams } from '../page/Fetch';
import { appInvoke } from './base';

export async function fetchData(params: FetchParams) {
  await appInvoke<FetchParams, unknown>('plugin:store|fetch', params);
}

export async function getTags() {
  return await appInvoke<unknown, Tag[]>('plugin:store|get_tags', {});
}
