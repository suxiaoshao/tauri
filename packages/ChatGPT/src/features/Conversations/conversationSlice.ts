import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction, RootState } from '../../app/store';
import { invoke } from '@tauri-apps/api';
import { Conversation } from '@chatgpt/types/conversation';
import { Message } from '@chatgpt/types/message';

export interface ConversationSliceType {
  value: Conversation[];
  selected?: Conversation;
}

export const conversationSlice = createSlice({
  name: 'menu',
  initialState: {
    value: [],
  } as ConversationSliceType,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.value = action.payload;
    },
    setSelected: (state, action: PayloadAction<Conversation | undefined>) => {
      state.selected = action.payload;
    },
    updateMessage: (state, { payload }: PayloadAction<Message>) => {
      const conversation = state.value.find((c) => (c.id = payload.conversationId));
      if (conversation) {
        const message = conversation.messages.findIndex((m) => m.id === payload.id);
        if (message >= 0) {
          conversation.messages[message] = payload;
        } else {
          conversation.messages.push(payload);
        }
        if (state.selected?.id === payload.conversationId) {
          state.selected.messages = conversation.messages;
        }
      }
      return state;
    },
  },
});

export const { setConversations, setSelected, updateMessage } = conversationSlice.actions;

export const selectConversations = (state: RootState) => state.conversation.value;
export const selectSelectedConversation = (state: RootState) => state.conversation.selected;

export const conversationReducer = conversationSlice.reducer;

export const fetchConversations = (): AppThunkAction => async (dispatch) => {
  const data = await invoke<Conversation[]>('plugin:chat|get_conversations');
  dispatch(setConversations(data));
};
