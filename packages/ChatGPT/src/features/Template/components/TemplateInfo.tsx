/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-01 03:16:39
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:49:36
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/components/TemplateInfo.tsx
 */
import { Badge } from '@chatgpt/components/ui/badge';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { getModeKey } from '@chatgpt/utils/getModeKey';
import { useTranslation } from 'react-i18next';

export default function TemplateInfo({ description, mode }: Pick<ConversationTemplate, 'description' | 'mode'>) {
  const { t } = useTranslation();
  return (
    <span className="leading-7">
      <Badge variant="outline">{t(getModeKey(mode))}</Badge>
      {description && ` ${description}`}
    </span>
  );
}
