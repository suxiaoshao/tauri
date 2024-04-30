/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-01 03:16:39
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:49:36
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/components/TemplateInfo.tsx
 */
import { Mode } from '@chatgpt/types/common';
import { ConversationTemplate } from '@chatgpt/types/conversation_template';
import { Chip, ChipProps, Typography } from '@mui/material';
import { useMemo } from 'react';

export default function TemplateInfo({ description, mode }: Pick<ConversationTemplate, 'description' | 'mode'>) {
  const color = useMemo<ChipProps['color']>(() => {
    switch (mode) {
      case Mode.AssistantOnly:
        return 'primary';
      case Mode.Contextual:
        return 'secondary';
      case Mode.Single:
        return 'tertiary';
      default:
        return 'default';
    }
  }, [mode]);
  return (
    <Typography variant="body2">
      <Chip color={color} label={mode} size="small" variant="outlined" />
      {description && ` ${description}`}
    </Typography>
  );
}
