/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:25
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/AssistantItem/LoadingItem.tsx
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { avatarClassName, markdownClassName, messageClassName, messageSelectedClassName } from '../../const';
import { type BaseMessage } from '../../types';
import { useState, useEffect } from 'react';
import { getSourceContent } from '@chatgpt/utils/content';
import { cn } from '@chatgpt/lib/utils';
import { Avatar, AvatarImage } from '@chatgpt/components/ui/avatar';
import { Spinner } from '@chatgpt/components/ui/spinner';
import { Separator } from '@chatgpt/components/ui/separator';

export interface LoadingItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function LoadingItem({ message, selected }: LoadingItemProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref && selected) {
      ref?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [ref, selected]);
  return (
    <>
      <div className={cn(selected && messageSelectedClassName, messageClassName)} ref={setRef}>
        <Avatar className={avatarClassName}>
          <AvatarImage src={assistant} />
        </Avatar>
        <CustomMarkdown className={markdownClassName} value={getSourceContent(message.content)} />
        <Spinner className="size-40 mr-4 mt-4" />
      </div>
      <Separator />
    </>
  );
}
