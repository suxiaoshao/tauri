import { useEffect } from 'react';
import { useNavigate, useLocation, createSearchParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export default function useConfig() {
  const apiKey = useAppSelector((state) => state.config.apiKey);
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const [urlSearch] = useSearchParams();

  useEffect(() => {
    if (!apiKey) {
      const url = pathname + search + hash;
      if (pathname !== '/error') {
        navigate({ pathname: '/error', search: createSearchParams({ from: url }).toString() });
      }
    } else {
      if (pathname === '/error') {
        const from = urlSearch.get('from');
        if (from === null) {
          navigate('/');
        } else {
          navigate(from);
        }
      }
    }
  }, [apiKey, hash, pathname, search, navigate, urlSearch]);
}
