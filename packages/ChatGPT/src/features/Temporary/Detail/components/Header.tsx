import { ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { Avatar, Box, Typography } from '@mui/material';

export interface TemporaryHeaderProps {
  template: ConversationTemplate;
}

export default function TemporaryHeader({ template }: TemporaryHeaderProps) {
  return (
    <Box
      data-tauri-drag-region
      sx={{
        width: '100%',
        display: 'flex',
        p: 1,
        justifyContent: 'center',
        boxShadow: (theme) => theme.shadows[3].split(',0px')[0],
      }}
    >
      <Avatar data-tauri-drag-region sx={{ backgroundColor: 'transparent' }}>
        {template.icon}
      </Avatar>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 1 }} data-tauri-drag-region>
        <Typography data-tauri-drag-region variant="h6" component="span" paragraph={false}>
          {template.name}
        </Typography>
        <Typography
          sx={{ ml: 1 }}
          data-tauri-drag-region
          variant="body2"
          color="inherit"
          component="span"
          paragraph={false}
        >
          {template.description}
        </Typography>
      </Box>
    </Box>
  );
}
