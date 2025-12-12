/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:10
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/AssistantItem/ErrorItem.tsx
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { avatarClassName, markdownClassName, messageClassName, messageSelectedClassName } from '../../const';
import { type BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import { useState, useEffect } from 'react';
import { getSourceContent } from '@chatgpt/utils/content';
import { Separator } from '@chatgpt/components/ui/separator';
import { cn } from '@chatgpt/lib/utils';
import { Avatar, AvatarImage } from '@chatgpt/components/ui/avatar';

export interface ErrorItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function ErrorItem({ message, selected }: ErrorItemProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref && selected) {
      ref?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [ref, selected]);
  return (
    <>
      <div
        className={cn(
          'border-l-2 border-solid border-destructive bg-destructive',
          selected && messageSelectedClassName,
          messageClassName,
        )}
        ref={setRef}
      >
        <Avatar className={avatarClassName}>
          <AvatarImage src={assistant} />
        </Avatar>
        <CustomMarkdown className={markdownClassName} value={getSourceContent(message.content)} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </div>
      <Separator />
    </>
  );
}
