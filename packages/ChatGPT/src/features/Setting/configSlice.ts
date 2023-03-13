import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import store, { RootState } from '../../app/store';

export type ConfigSliceType = {
  api_key?: string | null;
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {} as ConfigSliceType,
  reducers: {
    setConfig: (state, action: PayloadAction<ConfigSliceType>) => {
      state.api_key = action.payload.api_key;
    },
  },
});
export const { setConfig } = themeSlice.actions;

export const selectApiKey = (state: RootState) => state.config.api_key;

export default themeSlice.reducer;

appWindow.listen<ConfigSliceType>('config', (event) => {
  store.dispatch(setConfig(event.payload));
});

async function setInitDate(): Promise<void> {
  const config = await invoke<ConfigSliceType>('plugin:config|get_config');
  store.dispatch(setConfig(config));
}

setInitDate();
