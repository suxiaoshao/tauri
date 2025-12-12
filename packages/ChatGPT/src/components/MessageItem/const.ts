/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:52:58
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/const.ts
 */
import { cn } from '@chatgpt/lib/utils';

export const markdownClassName = cn('mx-4 my-6 flex-[1_1_0] overflow-hidden');

export const avatarClassName = cn('mt-4 ml-4 mb-4');

export const messageClassName = cn('flex flex-row w-full relative m-h-14 group');

export const toolClassName = cn('ml-0');

export const messageSelectedClassName = cn('border-3 border-primary border-solid rounded-sm');
