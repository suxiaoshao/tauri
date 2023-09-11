import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { Avatar, Box, Divider } from '@mui/material';
import user from '@chatgpt/assets/user.jpg';

export interface UserItemProps {
  message: Message;
}

export default function UserItem({ message }: UserItemProps) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          position: 'relative',
          minHeight: '56px',
        }}
      >
        <Avatar sx={{ ml: 2, mt: 2 }} src={user} />
        <CustomMarkdown
          sx={{ m: 2, mt: 3.5, flex: '1 1 0', width: (theme) => `calc(100% - ${theme.spacing(11.5)})` }}
          value={message.content}
        />
      </Box>
      <Divider />
    </>
  );
}
