/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 22:08:21
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:45:51
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/View.tsx
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import system from '@chatgpt/assets/system.png';
import user from '@chatgpt/assets/user.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import type { AdapterInputs } from '@chatgpt/types/adapter';
import { Role } from '@chatgpt/types/common';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { Details, type DetailsItem } from 'details';
import React, { useMemo } from 'react';
import { format } from 'time';
import { match } from 'ts-pattern';

export interface TemplateDetailViewProps {
  data: ConversationTemplate;
  inputs: AdapterInputs;
}
export default function TemplateDetailView({ data, inputs }: TemplateDetailViewProps) {
  const items = useMemo<DetailsItem[]>(
    () => [
      { label: 'name', value: data.name },
      { label: 'Icon', value: data.icon },
      { label: 'Mode', value: data.mode },
      ...inputs.inputs.map(
        (input) =>
          ({
            label: input.name,
            value: data.template?.[input.id] as React.ReactNode,
          }) as DetailsItem,
      ),
      { label: 'Created At', value: format(data.createdTime) },
      { label: 'Updated At', value: format(data.updatedTime) },
      { label: 'Description', value: data.description, span: 3 },
    ],
    [data, inputs],
  );
  return (
    <Box sx={{ flex: '1 1 0', overflowY: 'auto' }}>
      <Typography sx={{ ml: 2, mt: 2 }} variant="h6">
        Base Information
      </Typography>
      <Details sx={{ p: 2 }} items={items} />
      <Divider variant="middle" sx={{ mt: 1, mb: 1 }} />
      <Typography sx={{ ml: 2 }} variant="h6">
        Prompts
      </Typography>
      <List>
        {data.prompts.map((prompt) => {
          const avatar = match(prompt.role)
            .with(Role.user, () => user)
            .with(Role.assistant, () => assistant)
            .with(Role.developer, () => system)
            .otherwise(() => user);
          return (
            // eslint-disable-next-line label-has-associated-control
            <React.Fragment key={prompt.prompt}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={avatar} />
                </ListItemAvatar>
                <ListItemText primary={prompt.role} secondary={<CustomMarkdown value={prompt.prompt} />} />
              </ListItem>
              <Divider sx={{ mr: 2 }} variant="inset" component="li" />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}
