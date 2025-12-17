/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-30 00:42:28
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:47:11
 * @FilePath: /tauri/common/details/src/Item.tsx
 */
import { match, P } from 'ts-pattern';
import { type DetailsItem } from './types';
import { cn } from '@chatgpt/lib/utils';
import { FieldDescription, FieldLabel } from '@chatgpt/components/ui/field';

export default function Item({ label, value, span }: Omit<DetailsItem, 'key'>) {
  return (
    //  @ts-expect-error css variable property
    <div className={cn('flex flex-col col-span-(--span)')} style={{ '--span': span }}>
      <FieldLabel>{label}</FieldLabel>
      {match(value)
        .with(P.string.or(P.nullish), (value) => <FieldDescription>{value ?? '-'}</FieldDescription>)
        .otherwise((value) => value)}
    </div>
  );
}
