import { Routes, Route, Navigate } from 'react-router-dom';
import Query from '../page/Query';
import Fetch from '../page/Fetch';

export default function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Navigate to={'query'} />} />
        <Route path="query" element={<Query />} />
        <Route path="fetch" element={<Fetch />} />
      </Route>
    </Routes>
  );
}
