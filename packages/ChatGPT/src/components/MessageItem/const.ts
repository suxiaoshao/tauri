/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:52:58
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/const.ts
 */
import { type SxProps, type Theme } from '@mui/material';

export const MarkdownSx: SxProps<Theme> = {
  m: 2,
  mt: 3,
  mb: 3,
  flex: '1 1 0',
  overflowX: 'hidden',
};

export const AvatarSx: SxProps<Theme> = {
  ml: 2,
  mt: 2,
  mb: 2,
};

export const MessageSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  position: 'relative',
  minHeight: '56px',
  '&:hover > [data-toolbar]': {
    display: 'flex',
    position: 'absolute',
    right: (theme) => theme.spacing(1),
    top: (theme) => theme.spacing(0),
    alignItems: 'center',
  },
};

export const ToolSx: SxProps<Theme> = {
  ml: 0,
};
