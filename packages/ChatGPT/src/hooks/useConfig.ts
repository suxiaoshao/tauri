import { useEffect } from 'react';
import { useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export default function useConfig() {
  const apiKey = useAppSelector((state) => state.config.api_key);
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (!apiKey) {
      const url = pathname + search + hash;
      if (pathname !== '/error') {
        console.log(22222);
        navigate({ pathname: '/error', search: createSearchParams({ from: url }).toString() });
      }
    }
  }, [apiKey, hash, pathname, search, navigate]);
}
