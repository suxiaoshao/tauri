/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-09-23 03:07:13
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/FolderDetail/components/ContentEmpty.tsx
 */
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import { List } from '@mui/material';

export default function ContentEmpty() {
  return (
    <List>
      {/* eslint-disable-next-line label-has-associated-control */}
      <AddConversation.Item />
      {/* eslint-disable-next-line label-has-associated-control */}
      <AddFolder.Item />
    </List>
  );
}
