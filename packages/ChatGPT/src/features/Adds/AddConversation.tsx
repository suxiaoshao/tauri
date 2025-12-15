/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:49:26
 * @FilePath: /tauri/packages/ChatGPT/src/features/Adds/AddConversation.tsx
 */
import { addConversation } from '@chatgpt/service/chat/mutation';
import { type NewConversation } from '@chatgpt/types/conversation';
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { useCallback } from 'react';
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom';
import ConversationEdit, { type ConversationForm } from '../../components/ConversationEdit';
import { useTranslation } from 'react-i18next';
import { SidebarMenuButton, SidebarMenuItem } from '@chatgpt/components/ui/sidebar';
import { Button } from '@chatgpt/components/ui/button';

function AddConversation() {
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ info, ...data }: ConversationForm) => {
      await addConversation({
        data: {
          ...data,
          info: info?.trim(),
        } satisfies NewConversation,
      });
      navigate('/');
    },
    [navigate],
  );
  const { state } = useLocation();
  const { t } = useTranslation();
  return (
    <div className="size-full flex flex-col overflow-y-auto">
      <div className="shadow flex items-center gap-2 h-14" data-tauri-drag-region>
        <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <span data-tauri-drag-region className="text-xl leading-snug font-medium">
          {t('add_conversation')}
        </span>
        <div className="grow" />
        <Button size="icon" variant="ghost" form="conversation-form" type="submit">
          <Upload />
        </Button>
      </div>
      <ConversationEdit className="p-4" initialValues={state} id="conversation-form" onSubmit={handleSubmit} />
    </div>
  );
}

function AddConversationItem() {
  const matchAdd = useMatch('/add/conversation');
  const { t } = useTranslation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={matchAdd !== null}>
        <Link to="/add/conversation">
          <Plus />
          <span>{t('add_conversation')}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

AddConversation.Item = AddConversationItem;
export default AddConversation;
