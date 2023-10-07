import { SxProps, Theme } from '@mui/material';

export const MarkdownSx: SxProps<Theme> = {
  m: 2,
  mt: 3,
  mb: 3,
  flex: '1 1 0',
  overflowX: 'hidden',
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
