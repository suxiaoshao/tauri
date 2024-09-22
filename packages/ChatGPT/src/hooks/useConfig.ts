import { useConfigStore } from '@chatgpt/features/Setting/configSlice';
import { useEffect } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

export default function useConfig() {
  const apiKey = useConfigStore(useShallow((state) => state.apiKey));
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const [urlSearch] = useSearchParams();

  useEffect(() => {
    if (apiKey) {
      if (pathname === '/error') {
        const from = urlSearch.get('from');
        if (from === null) {
          navigate('/');
        } else {
          navigate(from);
        }
      }
    } else {
      const url = pathname + search + hash;
      if (pathname !== '/error') {
        navigate({ pathname: '/error', search: createSearchParams({ from: url }).toString() });
      }
    }
  }, [apiKey, hash, pathname, search, navigate, urlSearch]);
}
