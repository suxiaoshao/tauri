/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-09-23 03:07:13
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/FolderDetail/components/ContentEmpty.tsx
 */
import { Button } from '@chatgpt/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@chatgpt/components/ui/empty';
import { FolderCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ContentEmpty() {
  const { t } = useTranslation();
  return (
    <Empty className="size-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCode />
        </EmptyMedia>
        <EmptyTitle>{t('folder_empty_title')}</EmptyTitle>
        <EmptyDescription>{t('folder_empty_description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/add/folder">{t('create_folder')}</Link>
          </Button>
          <Button asChild>
            <Link to="/add/conversation">{t('create_conversation')}</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
