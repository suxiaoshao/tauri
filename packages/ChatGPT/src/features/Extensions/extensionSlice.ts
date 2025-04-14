import { getAllExtensionConfig } from '@chatgpt/service/extension';
import type { ExtensionConfig } from '@chatgpt/types/extension';
import { create } from 'zustand';

interface ExtensionState {
  value: ExtensionConfig[];
  fetchExtensions: () => Promise<void>;
}

export const useExtensionStore = create<ExtensionState>((set) => ({
  value: [],
  fetchExtensions: async () => {
    const data = await getAllExtensionConfig();
    set({ value: data });
  },
}));
