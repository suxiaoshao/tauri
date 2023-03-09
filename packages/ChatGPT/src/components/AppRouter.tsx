import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Setting from '../pages/Setting';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Home />} />
      </Route>
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
}
