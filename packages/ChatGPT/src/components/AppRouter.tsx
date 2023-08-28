import { Routes, Route } from 'react-router-dom';
import Errors from '../features/Errors';
import Home from '../features/Home';
import Setting from '../features/Setting';
import AppDrawer from './AppDrawer';
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';

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
      </Route>
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
}
