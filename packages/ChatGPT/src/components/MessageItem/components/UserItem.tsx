/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:49
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/UserItem.tsx
 */
import user from '@chatgpt/assets/user.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { avatarClassName, markdownClassName, messageClassName, messageSelectedClassName } from '../const';
import { type BaseMessage } from '../types';
import ToolBar from './ToolBar';
import CopyIcon from './ToolBar/CopyIcon';
import DeleteMessageIcon from './ToolBar/DeleteMessageIcon';
import ViewIcon from './ToolBar/ViewIcon';
import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { getSourceContent } from '@chatgpt/utils/content';
import { useTranslation } from 'react-i18next';
import { cn } from '@chatgpt/lib/utils';
import { Avatar, AvatarImage } from '@chatgpt/components/ui/avatar';
import { Separator } from '@chatgpt/components/ui/separator';
import { Badge } from '@chatgpt/components/ui/badge';

export interface UserItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function UserItem({ message, selected }: UserItemProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref && selected) {
      ref?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [ref, selected]);
  const { t } = useTranslation();
  return (
    <>
      <div className={cn(selected && messageSelectedClassName, messageClassName)} ref={setRef}>
        <Avatar className={avatarClassName}>
          <AvatarImage src={user} />
        </Avatar>
        {match(message.content)
          .with({ tag: 'text' }, ({ value }) => <CustomMarkdown className={markdownClassName} value={value} />)
          .with({ tag: 'extension' }, ({ value: { source } }) => (
            <CustomMarkdown className={markdownClassName} value={source} />
          ))
          .exhaustive()}

        <ToolBar>
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
          <CopyIcon content={getSourceContent(message.content)} />
          {match(message.content)
            .with({ tag: 'extension' }, ({ value: { extensionName } }) => (
              <Badge variant="outline">{t('plugin_name', { name: extensionName })}</Badge>
            ))
            .otherwise(() => null)}
        </ToolBar>
      </div>
      <Separator />
    </>
  );
}
