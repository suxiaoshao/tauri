/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 06:00:04
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:14:09
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/header.tsx
 */
import { Avatar, AvatarFallback } from '@chatgpt/components/ui/avatar';
import { Button } from '@chatgpt/components/ui/button';
import { Skeleton } from '@chatgpt/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@chatgpt/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { Alignment } from '@chatgpt/features/MessagePreview/Success';
import { type PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import { deleteConversationTemplate } from '@chatgpt/service/chat/mutation';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { ArrowLeft, Eye, Edit, RefreshCcw, Save, Trash } from 'lucide-react';
import { enqueueSnackbar } from 'notify';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { match } from 'ts-pattern';

export interface TemplateDetailHeaderProps {
  refresh: () => void;
  data: PromiseData<ConversationTemplate>;
  alignment: Alignment;
  handleAlignment: (newAlignment: string | null) => void;
  formId: string;
}

export default function TemplateDetailHeader({
  data,
  refresh,
  alignment,
  handleAlignment,
  formId,
}: TemplateDetailHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const content = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.loading }, () => (
        <>
          <Skeleton className="rounded-full size-10" />
          <Skeleton className="h-4 w-[250px]" />
        </>
      ))
      .with({ tag: PromiseStatus.error }, () => (
        <span className="text-xl leading-snug font-medium" data-tauri-drag-region>
          {t('conversation_templates')}
        </span>
      ))
      .with({ tag: PromiseStatus.data }, ({ value }) => (
        <>
          <span className="text-xl leading-snug font-medium" data-tauri-drag-region>
            {value.name}
          </span>
          <Avatar data-tauri-drag-region>
            <AvatarFallback className="bg-transparent">{value.icon}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-accent-foreground" data-tauri-drag-region>
            {value.description}
          </span>
        </>
      ))
      .otherwise(() => (
        <span className="text-xl leading-snug font-medium" data-tauri-drag-region>
          {t('conversation_templates')}
        </span>
      ));
  }, [data, t]);
  const deleteButton = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.data }, ({ value }) => {
        const handleDelete = async () => {
          await deleteConversationTemplate({ id: value.id });
          navigate('/template');
          enqueueSnackbar(t('conversation_template_deleted'), { variant: 'success' });
        };
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('delete')}</TooltipContent>
          </Tooltip>
        );
      })
      .otherwise(() => null);
  }, [data, navigate, t]);
  const submitButton = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.data }, () => {
        return match(alignment)
          .with(Alignment.edit, () => (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" type="submit" form={formId}>
                  <Save />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('save')}</TooltipContent>
            </Tooltip>
          ))
          .otherwise(() => null);
      })
      .otherwise(() => null);
  }, [data, formId, alignment, t]);
  return (
    <div className="w-full flex p-2 justify-center shadow items-center gap-2" data-tauri-drag-region>
      <div className="grow flex items-center gap-2" data-tauri-drag-region>
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        {content}
      </div>
      <ToggleGroup variant="outline" type="single" value={alignment} onValueChange={handleAlignment}>
        <ToggleGroupItem value={Alignment.preview}>
          <Eye />
        </ToggleGroupItem>
        <ToggleGroupItem value={Alignment.edit}>
          <Edit />
        </ToggleGroupItem>
      </ToggleGroup>
      <div>
        <Button variant="ghost" size="icon" disabled={data.tag === 'loading'} onClick={refresh}>
          <RefreshCcw />
        </Button>
        {deleteButton}
        {submitButton}
      </div>
    </div>
  );
}
