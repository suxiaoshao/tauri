/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:23:05
 * @FilePath: /tauri/packages/ChatGPT/src/components/AppRouter.tsx
 */
import { Routes, Route } from 'react-router-dom';
import Errors from '../features/Errors';
import Home from '../features/Home';
import Setting from '../features/Setting';
import AppDrawer from './AppDrawer';
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import MessagePreview from '@chatgpt/features/MessagePreview';
import ConversationTemplateList from '@chatgpt/features/Template/List';
import ConversationTemplateDetail from '@chatgpt/features/Template/Detail';
import ConversationTemplateCreate from '@chatgpt/features/Template/Create';
import TemporaryList from '@chatgpt/features/Temporary/List';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppDrawer />}>
        <Route index element={<Home />} />
        <Route path="error" element={<Errors />} />
        <Route path="add">
          <Route path="conversation" element={<AddConversation />} />
          <Route path="folder" element={<AddFolder />} />
        </Route>
        <Route path="template">
          <Route index element={<ConversationTemplateList />} />
          <Route path=":id" element={<ConversationTemplateDetail />} />
          <Route path="create" element={<ConversationTemplateCreate />} />
        </Route>
      </Route>
      <Route path="/setting" element={<Setting />} />
      <Route path="/message/:id" element={<MessagePreview />} />
      <Route path="/temporary_conversation">
        <Route index element={<TemporaryList />} />
      </Route>
    </Routes>
  );
}
