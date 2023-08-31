import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import { List } from '@mui/material';

export default function ContentEmpty() {
  return (
    <List>
      <AddConversation.Item />
      <AddFolder.Item />
    </List>
  );
}
