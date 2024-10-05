import AppRouter from '@chatgpt/components/AppRouter';
import { useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { type RouterEvent } from '@chatgpt/types/router';

export function resolveRouterEvent({ isUpdate, path, conversationSelected }: RouterEvent) {
  const resolveFunc = () => {
    AppRouter.navigate(path);
    if (conversationSelected) {
      useConversationStore.getState().setSelected(conversationSelected);
    }
  };
  return { isUpdate, resolveFunc };
}
