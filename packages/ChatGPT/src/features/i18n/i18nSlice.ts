import { create } from 'zustand';
import { Language } from '../Setting/types';

export interface I18nType {
  language: string;
}

export interface I18nAction {
  setSystemLanguage: (language: string) => void;
}

export const getLanguage = (languageSetting: Language, systemLanguage: I18nType['language']) => {
  if (languageSetting === Language.System) {
    return systemLanguage;
  }
  return languageSetting;
};

function getInitialLanguage(): I18nType {
  const systemLanguage = navigator.language;
  return {
    language: systemLanguage,
  };
}

export const useI18nStore = create<I18nType & I18nAction>((set) => ({
  ...getInitialLanguage(),
  setSystemLanguage: (language) => set({ language }),
}));
