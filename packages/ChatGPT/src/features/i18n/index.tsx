import i18n, { changeLanguage, type Resource } from 'i18next';
import { useEffect, useMemo } from 'react';
import { initReactI18next } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useConfigStore } from '../Setting/configSlice';
import { getLanguage, useI18nStore } from './i18nSlice';
import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
} satisfies Resource;

// eslint-disable-next-line no-named-as-default-member
i18n.use(initReactI18next).init<typeof resources>({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export interface I18nextProps {
  children: React.ReactNode;
}

export default function I18next({ children }: I18nextProps) {
  const { language, setSystemLanguage } = useI18nStore(
    useShallow(({ language, setSystemLanguage }) => ({ language, setSystemLanguage })),
  );
  const langSetting = useConfigStore(useShallow((state) => state.language));
  const lang = useMemo(() => {
    return getLanguage(langSetting, language);
  }, [langSetting, language]);
  useEffect(() => {
    changeLanguage(lang);
  }, [lang]);

  useEffect(() => {
    const abort = new AbortController();
    window.addEventListener(
      'languagechange',
      () => {
        setSystemLanguage(navigator.language);
      },
      { signal: abort.signal },
    );
    return () => {
      abort.abort();
    };
  }, [setSystemLanguage]);

  return children;
}
