import { type TemporaryMessageEvent, type TemporaryConversation } from '@chatgpt/types/temporaryConversation';
import { create } from 'zustand';
import { match } from 'ts-pattern';
import { type PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getTemporaryConversation } from '@chatgpt/service/temporaryConversation/query';

export type TemporaryConversationState = PromiseData<TemporaryConversation>;

export interface TemporaryConversationStore {
  state: TemporaryConversationState;
  updateMessage: (message: TemporaryMessageEvent) => void;
  fetchData: (persistentId: number | null) => Promise<void>;
}

export const useTemporaryConversationStore = create<TemporaryConversationStore>((set, get) => ({
  state: { tag: PromiseStatus.init } as const,
  updateMessage: ({ message, persistentId }) => {
    const { state } = get();
    match(state)
      .with({ tag: PromiseStatus.data, value: { persistentId } }, (state) => {
        const index = state.value.messages.findIndex((m) => m.id === message.id);
        if (index === -1) {
          set({
            state: {
              tag: PromiseStatus.data,
              value: { ...state.value, messages: [...state.value.messages, message] } satisfies TemporaryConversation,
            },
          });
          return;
        }
        const newMessages = state.value.messages.with(index, message);
        set({
          state: {
            tag: PromiseStatus.data,
            value: { ...state.value, messages: newMessages } satisfies TemporaryConversation,
          },
        });
      })
      .otherwise(() => null);
  },
  fetchData: async (persistentId) => {
    set(() => ({ state: { tag: PromiseStatus.loading } }));
    try {
      const data = await getTemporaryConversation({ persistentId });
      set(() => ({ state: { tag: PromiseStatus.data, value: data } }));
    } catch (error) {
      if (error instanceof Error) {
        set(() => ({ state: { tag: PromiseStatus.error, value: error } }));
      }
      set({
        state: { tag: PromiseStatus.error, value: new Error(`Unknown Error:${error}`) },
      });
    }
  },
}));
