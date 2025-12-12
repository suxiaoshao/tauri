/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 01:48:57
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:08:04
 * @FilePath: /tauri/packages/ChatGPT/src/components/ErrorInfo/index.tsx
 */
import { useTranslation } from 'react-i18next';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty';
import { Button } from '../ui/button';
import { Bug } from 'lucide-react';
import type { ComponentProps } from 'react';

export interface ErrorInfoProps extends ComponentProps<'div'> {
  error: Error;
  refetch?: () => void;
}

export default function ErrorInfo({ error, refetch, ...props }: ErrorInfoProps) {
  const { t } = useTranslation();
  return (
    <Empty {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Bug />
        </EmptyMedia>
        <EmptyTitle>{t('error')}</EmptyTitle>
        <EmptyDescription>{error.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <span className="flex gap-2">
          {t('error_page_button_tips1')}
          <Button variant="link" onClick={refetch}>
            {t('error_page_button_tips2')}
          </Button>
          {t('error_page_button_tips3')}
        </span>
      </EmptyContent>
    </Empty>
  );
}
