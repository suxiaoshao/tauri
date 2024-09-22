/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-30 23:32:15
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:45:58
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/templateSlice.ts
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../../app/types';
import { ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { allConversationTemplates } from '@chatgpt/service/chat/query';

export const templateSlice = createSlice({
  name: 'template',
  initialState: { value: [] as ConversationTemplate[] },
  reducers: {
    setTemplates: (state, action: PayloadAction<ConversationTemplate[]>) => {
      state.value = action.payload;
    },
  },
  selectors: {
    selectTemplates: (state) => state.value,
    selectTemplateCount: (state) => state.value.length,
  },
});
export const { setTemplates } = templateSlice.actions;

export const { selectTemplates, selectTemplateCount } = templateSlice.selectors;

export default templateSlice.reducer;

export const fetchTemplates = (): AppThunkAction => async (dispatch) => {
  const data = await allConversationTemplates();
  dispatch(setTemplates(data));
};
