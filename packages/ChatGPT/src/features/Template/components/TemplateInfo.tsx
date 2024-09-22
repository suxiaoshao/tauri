/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-01 03:16:39
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:49:36
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/components/TemplateInfo.tsx
 */
import { Mode } from '@chatgpt/types/common';
import { ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { Chip, ChipProps, Typography } from '@mui/material';
import { useMemo } from 'react';
import { match } from 'ts-pattern';

export default function TemplateInfo({ description, mode }: Pick<ConversationTemplate, 'description' | 'mode'>) {
  const color = useMemo<ChipProps['color']>(
    () =>
      match(mode)
        .with(Mode.AssistantOnly, () => 'primary' as const)
        .with(Mode.Contextual, () => 'secondary' as const)
        .with(Mode.Single, () => 'tertiary' as const)
        .otherwise(() => 'default' as const),
    [mode],
  );
  return (
    <Typography variant="body2">
      <Chip color={color} label={mode} size="small" variant="outlined" />
      {description && ` ${description}`}
    </Typography>
  );
}
