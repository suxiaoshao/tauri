import { Routes, Route } from 'react-router-dom';
import Errors from '../features/Errors';
import Home from '../features/Home';
import Setting from '../features/Setting';
import Headers from './Headers';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Headers />}>
        <Route index element={<Home />} />
        <Route path="/error" element={<Errors />} />
      </Route>
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
}
