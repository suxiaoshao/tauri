/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:23:05
 * @FilePath: /tauri/packages/ChatGPT/src/components/AppRouter.tsx
 */
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import MessagePreview from '@chatgpt/features/MessagePreview';
import ConversationTemplateCreate from '@chatgpt/features/Template/Create';
import ConversationTemplateDetail from '@chatgpt/features/Template/Detail';
import ConversationTemplateList from '@chatgpt/features/Template/List';
import Temporary from '@chatgpt/features/Temporary';
import TemporaryDetail from '@chatgpt/features/Temporary/Detail';
import TemporaryList from '@chatgpt/features/Temporary/List';
import TemporaryMessagePreview from '@chatgpt/features/Temporary/Message';
import Errors from '../features/Errors';
import Home from '../features/Home';
import Setting from '../features/Setting';
import AppDrawer from './AppDrawer';

import { createBrowserRouter } from 'react-router-dom';

const AppRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppDrawer />,
    children: [
      { index: true, element: <Home /> },
      { path: 'error', element: <Errors /> },
      {
        path: 'add',
        children: [
          { path: 'conversation', element: <AddConversation /> },
          { path: 'folder', element: <AddFolder /> },
        ],
      },
      {
        path: 'template',
        children: [
          { index: true, element: <ConversationTemplateList /> },
          { path: ':id', element: <ConversationTemplateDetail /> },
          { path: 'create', element: <ConversationTemplateCreate /> },
        ],
      },
    ],
  },
  { path: '/setting', element: <Setting /> },
  { path: '/message/:id', element: <MessagePreview /> },
  {
    path: '/temporary_conversation',
    element: <Temporary />,
    children: [
      { index: true, element: <TemporaryList /> },
      { path: 'detail', element: <TemporaryDetail /> },
    ],
  },
  {
    path: '/temporary_conversation/message',
    element: <TemporaryMessagePreview />,
  },
]);
export default AppRouter;
