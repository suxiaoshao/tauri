import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction, RootState } from '../../app/store';
import { invoke } from '@tauri-apps/api';
import { Message } from '@chatgpt/types/message';
import { ChatData } from '@chatgpt/types/chatData';
import { findConversation, firstConversation, getNodeId } from '@chatgpt/utils/chatData';
import { Enum } from 'types';

export enum SelectedType {
  Conversation = 'Conversation',
  Folder = 'Folder',
  None = 'None',
}
export type Selected =
  | Enum<SelectedType.Conversation, number>
  | Enum<SelectedType.Folder, number>
  | Enum<SelectedType.None>;

export interface ConversationSliceType {
  value: ChatData;
  selected: Selected;
}

export const conversationSlice = createSlice({
  name: 'menu',
  initialState: {
    value: { conversations: [], folders: [] },
    selected: { tag: SelectedType.None },
  } as ConversationSliceType,
  reducers: {
    setChatData: (state, action: PayloadAction<ChatData>) => {
      state.value = action.payload;
    },
    setSelected: (state, action: PayloadAction<Selected>) => {
      state.selected = action.payload;
    },
    updateMessage: (state, { payload }: PayloadAction<Message>) => {
      const conversation = findConversation(state.value, payload.conversationId);
      if (conversation) {
        const message = conversation.messages.findIndex((m) => m.id === payload.id);
        if (message >= 0) {
          conversation.messages[message] = payload;
        } else {
          conversation.messages.push(payload);
        }
      }
    },
  },
});

export const { setChatData, setSelected, updateMessage } = conversationSlice.actions;

export const selectConversations = (state: RootState) => state.conversation.value;
export const selectSelectedConversation = (state: RootState) => {
  switch (state.conversation.selected.tag) {
    case SelectedType.Conversation:
      return findConversation(state.conversation.value, state.conversation.selected.value);
    default:
      return null;
  }
};

export const selectSelectedNodeId = (state: RootState) => getNodeId(state.conversation.selected);

export const conversationReducer = conversationSlice.reducer;

export const fetchConversations = (): AppThunkAction => async (dispatch) => {
  const data = await invoke<ChatData>('plugin:chat|get_chat_data');
  dispatch(setChatData(data));
  const conversation = firstConversation(data);
  if (conversation) {
    dispatch(setSelected({ value: conversation.id, tag: SelectedType.Conversation }));
  }
};
