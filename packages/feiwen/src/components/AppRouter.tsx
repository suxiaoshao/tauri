import { Navigate, Route, Routes } from 'react-router-dom';
import Fetch from '../page/Fetch';
import Query from '../page/Query';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Navigate to="query" />} />
        <Route path="query" element={<Query />} />
        <Route path="fetch" element={<Fetch />} />
      </Route>
    </Routes>
  );
}
