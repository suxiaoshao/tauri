/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-30 00:05:48
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:48:14
 * @FilePath: /tauri/common/details/src/Details.tsx
 */
import Item from './Item';
import { type DetailsItem } from './types';
import type { ComponentProps } from 'react';
import { cn } from '@chatgpt/lib/utils';

export interface DetailsProps extends ComponentProps<'div'> {
  items: DetailsItem[];
  fullSpan?: number;
}

export default function Details({ items, className, fullSpan = 3, ...props }: DetailsProps) {
  return (
    <div
      className={cn('grid grid-cols-[repeat(var(--fullSpan),1fr)] gap-2', className)}
      // @ts-expect-error css variable property
      style={{ '--fullSpan': fullSpan }}
      {...props}
    >
      {items.map(({ key, ...props }) => (
        <Item key={key ?? props.label} {...props} />
      ))}
    </div>
  );
}
