/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 22:32:11
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:18:50
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/header.tsx
 */
import { Button } from '@chatgpt/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export interface TemplateCreateHeaderProps {
  formId: string;
}

export default function TemplateCreateHeader({ formId }: TemplateCreateHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="w-full flex p-2 justify-center shadow" data-tauri-drag-region>
      <div className="grow flex items-center gap-2" data-tauri-drag-region>
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <span className="text-xl leading-snug font-medium" data-tauri-drag-region>
          {t('create_template')}
        </span>
      </div>
      <Button variant="ghost" size="icon" type="submit" form={formId}>
        <Upload />
      </Button>
    </div>
  );
}
