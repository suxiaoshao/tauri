/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-30 23:32:15
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:45:58
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/templateSlice.ts
 */
import { allConversationTemplates } from '@chatgpt/service/chat/query';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { create } from 'zustand';

interface TemplateState {
  templates: ConversationTemplate[];
  setTemplates: (templates: ConversationTemplate[]) => void;
  fetchTemplates: () => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  setTemplates: (templates) => set({ templates }),
  fetchTemplates: async () => {
    const data = await allConversationTemplates();
    set({ templates: data });
  },
}));

export const selectTemplates = (state: TemplateState) => state.templates;
export const selectTemplateCount = (state: TemplateState) => state.templates.length;
