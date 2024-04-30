/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-01 01:21:43
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:12:40
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Create/index.tsx
 */
import { Box } from '@mui/material';
import TemplateCreateHeader from './Header';
import TemplateEdit, { TemplateForm } from '../components/TemplateEdit';
import { useCallback } from 'react';
import { addConversationTemplate } from '@chatgpt/service/chat/mutation';
import { NewConversationTemplate } from '@chatgpt/types/conversation_template';
import { useNavigate } from 'react-router-dom';

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
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <TemplateCreateHeader formId={formId} />
      <TemplateEdit id={formId} onSubmit={handleSubmit} />
    </Box>
  );
}
