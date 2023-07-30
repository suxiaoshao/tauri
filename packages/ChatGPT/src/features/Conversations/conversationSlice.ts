import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction, RootState } from '../../app/store';
import { invoke } from '@tauri-apps/api';

export interface Conversation {
  id: number;
  title: string;
  mode: string;
  createdTime: number;
  updatedTime: number;
  info?: string | null;
  prompt?: string | null;
}

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
  },
});

export const { setConversations, setSelected } = conversationSlice.actions;

export const selectConversations = (state: RootState) => state.conversation.value;
export const selectSelectedConversation = (state: RootState) => state.conversation.selected;

export const conversationReducer = conversationSlice.reducer;

export const fetchConversations = (): AppThunkAction => async (dispatch) => {
  const data = await invoke<Conversation[]>('plugin:chat|get_conversations');
  dispatch(setConversations(data));
};
