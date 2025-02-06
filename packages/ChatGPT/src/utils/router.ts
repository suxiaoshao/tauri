import AppRouter from '@chatgpt/components/AppRouter';
import { type RouterEvent } from '@chatgpt/types/router';

export function resolveRouterEvent({ isUpdate, path }: RouterEvent) {
  const resolveFunc = () => {
    AppRouter.navigate(path);
  };
  return { isUpdate, resolveFunc };
}
