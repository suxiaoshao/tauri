/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-09-23 06:56:59
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-09-23 07:26:27
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/conversationSlice.ts
 */
import { getChatData } from '@chatgpt/service/chat/query';
import { type ChatData } from '@chatgpt/types/chatData';
import { type Conversation } from '@chatgpt/types/conversation';
import { type Folder } from '@chatgpt/types/folder';
import { type Message } from '@chatgpt/types/message';
import { findConversation } from '@chatgpt/utils/chatData';
import { produce } from 'immer';
import { create } from 'zustand';

interface ConversationState {
  value: { conversations: Conversation[]; folders: Folder[] };
  setChatData: (chatData: ChatData) => void;
  updateMessage: (message: Message) => void;
  fetchConversations: () => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set) => ({
  value: { conversations: [], folders: [] },
  setChatData: (chatData) => set((state) => ({ ...state, value: chatData })),
  updateMessage: (message) =>
    set(
      produce((state: ConversationState) => {
        const conversation = findConversation(state.value, message.conversationId);
        if (conversation) {
          const messageIndex = conversation.messages.findIndex((m) => m.id === message.id);
          if (messageIndex >= 0) {
            conversation.messages[messageIndex] = message;
          } else {
            conversation.messages.push(message);
          }
        }
      }),
    ),
  fetchConversations: async () => {
    const data = await getChatData();
    set((state) => ({ ...state, value: data }));
  },
}));

export const selectChatData = (state: ConversationState) => state.value;
export const SELECT_FOLDERS = (state: ConversationState) => state.value.folders;
