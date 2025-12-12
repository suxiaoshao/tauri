import assistant from '@chatgpt/assets/assistant.jpg';
import { avatarClassName, messageClassName, messageSelectedClassName } from '../../const';
import { type BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import { useState, useEffect } from 'react';
import { cn } from '@chatgpt/lib/utils';
import { Separator } from '@chatgpt/components/ui/separator';
import { Avatar, AvatarImage } from '@chatgpt/components/ui/avatar';

export interface HiddenItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function HiddenItem({ message, selected }: HiddenItemProps) {
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
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </div>
      <Separator />
    </>
  );
}
