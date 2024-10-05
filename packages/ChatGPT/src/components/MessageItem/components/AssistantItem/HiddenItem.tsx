import assistant from '@chatgpt/assets/assistant.jpg';
import { Avatar, Box, Divider } from '@mui/material';
import { AvatarSx, MessageSelectedSx, MessageSx } from '../../const';
import { type BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import { useState, useEffect } from 'react';
import { match } from 'ts-pattern';

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
  const sx = match(selected)
    .with(true, () => ({ ...MessageSx, ...MessageSelectedSx }))
    .otherwise(() => MessageSx);
  return (
    <>
      <Box sx={sx} ref={setRef}>
        <Avatar sx={AvatarSx} src={assistant} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
