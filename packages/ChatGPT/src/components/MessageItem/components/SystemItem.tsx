/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:44
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/SystemItem.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import CustomMarkdown from '@chatgpt/components/Markdown';
import { avatarClassName, markdownClassName, messageClassName, messageSelectedClassName } from '../const';
import { type BaseMessage } from '../types';
import ToolBar from './ToolBar';
import CopyIcon from './ToolBar/CopyIcon';
import DeleteMessageIcon from './ToolBar/DeleteMessageIcon';
import ViewIcon from './ToolBar/ViewIcon';
import { useState, useEffect } from 'react';
import { getSourceContent } from '@chatgpt/utils/content';
import { cn } from '@chatgpt/lib/utils';
import { Separator } from '@chatgpt/components/ui/separator';
import { Avatar, AvatarFallback } from '@chatgpt/components/ui/avatar';

interface SystemItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function SystemItem({ message, selected }: SystemItemProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref && selected) {
      ref?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [ref, selected]);
  return (
    <>
      <div className={cn(selected && messageSelectedClassName, messageClassName)} ref={setRef}>
        <Avatar className={cn('bg-transparent', avatarClassName)}>
          <AvatarFallback className="bg-transparent">🤖</AvatarFallback>
        </Avatar>
        <CustomMarkdown className={markdownClassName} value={getSourceContent(message.content)} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
          <CopyIcon content={getSourceContent(message.content)} />
        </ToolBar>
      </div>
      <Separator />
    </>
  );
}
