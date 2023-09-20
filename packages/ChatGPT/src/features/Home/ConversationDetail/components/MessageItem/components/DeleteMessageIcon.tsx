import { Delete } from '@mui/icons-material';
import { ToolSx } from '../const';
import { deleteMessage } from '@chatgpt/service/chat';
import { useCallback } from 'react';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';

export interface DeleteMessageIconProps {
  id: number;
}
export default function DeleteMessageIcon({ id }: DeleteMessageIconProps) {
  const dispatch = useAppDispatch();
  const handleClick = useCallback(async () => {
    await deleteMessage({ id });
    dispatch(fetchConversations());
  }, [dispatch, id]);
  return <Delete onClick={handleClick} fontSize={'small'} sx={ToolSx} />;
}
