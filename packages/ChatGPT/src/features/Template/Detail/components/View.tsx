/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 22:08:21
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:45:51
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/View.tsx
 */
import CustomMarkdown from '@chatgpt/components/Markdown';
import { ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { Details, DetailsItem } from 'details';
import React, { useMemo } from 'react';
import system from '@chatgpt/assets/system.png';
import assistant from '@chatgpt/assets/assistant.jpg';
import user from '@chatgpt/assets/user.jpg';
import { Role } from '@chatgpt/types/common';
import { format } from 'time';
import { match } from 'ts-pattern';

export interface TemplateDetailViewProps {
  data: ConversationTemplate;
}
export default function TemplateDetailView({ data }: TemplateDetailViewProps) {
  const items = useMemo<DetailsItem[]>(
    () => [
      { label: 'name', value: data.name },
      { label: 'Icon', value: data.icon },
      { label: 'Mode', value: data.mode },
      { label: 'Model', value: data.model },
      { label: 'Temperature', value: data.temperature },
      { label: 'Top P', value: data.topP },
      { label: 'N', value: data.n },
      { label: 'Presence Penalty', value: data.presencePenalty },
      { label: 'Frequency Penalty', value: data.frequencyPenalty },
      { label: 'Max Tokens', value: data.maxTokens },
      { label: 'Created At', value: format(data.createdTime) },
      { label: 'Updated At', value: format(data.updatedTime) },
      { label: 'Description', value: data.description, span: 3 },
    ],
    [data],
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
            .with(Role.system, () => system)
            .otherwise(() => user);
          return (
            // eslint-disable-next-line label-has-associated-control
            <React.Fragment key={prompt.id}>
              <ListItem alignItems="flex-start" key={prompt.id}>
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
