/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 02:11:33
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:16:42
 * @FilePath: /tauri/packages/ChatGPT/src/components/Loading/index.tsx
 */
import { cn } from '@chatgpt/lib/utils';
import type { ComponentProps } from 'react';
import { Spinner } from '../ui/spinner';

export default function Loading({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex justify-center items-center', className)} {...props}>
      <Spinner />
    </div>
  );
}
