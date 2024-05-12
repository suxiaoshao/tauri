import { Delete } from '@mui/icons-material';
import { ToolSx } from '../../const';
import { deleteMessage } from '@chatgpt/service/chat/mutation';
import { useCallback } from 'react';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { IconButton } from '@mui/material';

export interface DeleteMessageIconProps {
  id: number;
}
export default function DeleteMessageIcon({ id }: DeleteMessageIconProps) {
  const dispatch = useAppDispatch();
  const handleClick = useCallback(async () => {
    await deleteMessage({ id });
    dispatch(fetchConversations());
  }, [dispatch, id]);
  return (
    <IconButton size="small" onClick={handleClick}>
      <Delete fontSize={'small'} sx={ToolSx} />
    </IconButton>
  );
}
