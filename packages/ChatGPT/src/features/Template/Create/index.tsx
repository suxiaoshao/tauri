/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-01 01:21:43
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:12:40
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Create/index.tsx
 */
import { addConversationTemplate } from '@chatgpt/service/chat/mutation';
import { type NewConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateEdit, { type TemplateForm } from '../components/TemplateEdit';
import TemplateCreateHeader from './Header';

const formId = 'template-form';

export default function ConversationTemplateCreate() {
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ description, ...data }: TemplateForm) => {
      const id = await addConversationTemplate({
        data: {
          ...data,
          description: description?.trim() ?? null,
        } satisfies NewConversationTemplate,
      });
      navigate(`/template/${id}`, { replace: true });
    },
    [navigate],
  );
  return (
    <div className="size-full flex flex-col">
      <TemplateCreateHeader formId={formId} />
      <TemplateEdit id={formId} onSubmit={handleSubmit} />
    </div>
  );
}
