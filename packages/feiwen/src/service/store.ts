import { type Tag } from '@feiwen/types/tag';
import { type FetchParams } from '../page/types';
import { appInvoke } from './base';

export async function fetchData(params: FetchParams) {
  await appInvoke<FetchParams, unknown>('plugin:store|fetch', params);
}

export async function getTags() {
  return await appInvoke<unknown, Tag[]>('plugin:store|get_tags', {});
}
