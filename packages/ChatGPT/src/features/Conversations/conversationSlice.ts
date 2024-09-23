/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-09-23 06:56:59
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-09-23 07:26:27
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/conversationSlice.ts
 */
import { getChatData } from '@chatgpt/service/chat/query';
import { ChatData } from '@chatgpt/types/chatData';
import { Conversation } from '@chatgpt/types/conversation';
import { Folder } from '@chatgpt/types/folder';
import { Message } from '@chatgpt/types/message';
import { findConversation, findFolder, getFirstConversation, getNodeId } from '@chatgpt/utils/chatData';
import { produce } from 'immer';
import { match } from 'ts-pattern';
import { Enum } from 'types';
import { create } from 'zustand';
import { Selected, SelectedType } from './types';

interface ConversationState {
  value: { conversations: Conversation[]; folders: Folder[] };
  selected: Selected;
  setChatData: (chatData: ChatData) => void;
  setSelected: (selected: Selected) => void;
  updateMessage: (message: Message) => void;
  fetchConversations: () => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  value: { conversations: [], folders: [] },
  selected: { tag: SelectedType.None } as const,
  setChatData: (chatData) => set((state) => ({ ...state, value: chatData })),
  setSelected: (selected) => set((state) => ({ ...state, selected })),
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
    const oldState = get().selected;
    let noneSelected: Selected = { tag: SelectedType.None };
    const firstConversation = getFirstConversation(data);
    if (firstConversation) {
      noneSelected = { value: firstConversation.id, tag: SelectedType.Conversation };
    }

    match(oldState)
      .with({ tag: SelectedType.Folder }, ({ value }) => {
        const folder = findFolder(data, value);
        if (!folder) {
          get().setSelected(noneSelected);
        }
      })
      .with({ tag: SelectedType.Conversation }, ({ value }) => {
        const conversation = findConversation(data, value);
        if (!conversation) {
          get().setSelected(noneSelected);
        }
      })
      .with({ tag: SelectedType.None }, () => {
        get().setSelected(noneSelected);
      })
      .exhaustive();
  },
}));

export const selectChatData = (state: ConversationState) => state.value;
export const SELECT_FOLDERS = (state: ConversationState) => state.value.folders;
export const selectSelected = (
  state: ConversationState,
): Enum<SelectedType.Conversation, Conversation> | Enum<SelectedType.Folder, Folder> | Enum<SelectedType.None> => {
  return match(state.selected)
    .with({ tag: SelectedType.Folder }, (selected) => {
      return match(findFolder(state.value, selected.value))
        .with(null, () => ({ tag: SelectedType.None }) as const)
        .otherwise((folder) => ({ tag: SelectedType.Folder, value: folder }) as const);
    })
    .with({ tag: SelectedType.Conversation }, (selected) => {
      return match(findConversation(state.value, selected.value))
        .with(null, () => ({ tag: SelectedType.None }) as const)
        .otherwise((conversation) => ({ tag: SelectedType.Conversation, value: conversation }) as const);
    })
    .otherwise(() => ({ tag: SelectedType.None }));
};
export const selectSelectedNodeId = (state: ConversationState) => getNodeId(state.selected);
export const selectSelectedFolderId = (state: ConversationState) => {
  return match(state.selected)
    .with({ tag: SelectedType.Folder }, (selected) => selected.value)
    .with(
      { tag: SelectedType.Conversation },
      (selected) => findConversation(state.value, selected.value)?.folderId ?? null,
    )
    .otherwise(() => null);
};
