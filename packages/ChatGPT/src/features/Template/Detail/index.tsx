/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:43
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 03:04:40
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/index.tsx
 */
import usePromise from '@chatgpt/hooks/usePromise';
import { findConversationTemplate } from '@chatgpt/service/chat';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

export default function ConversationTemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const fn = useCallback(async () => {
    if (!id) {
      throw new Error('id is empty');
    }
    const templateId = parseInt(id);
    // Fetch template detail
    const template = await findConversationTemplate({ id: templateId });
    return template;
  }, [id]);
  const [{ tag, value }, refresh] = usePromise(fn);
  return (
    <div>
      <h1>Conversation Template Detail</h1>
    </div>
  );
}
