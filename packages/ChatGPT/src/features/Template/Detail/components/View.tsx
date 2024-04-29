/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 22:08:21
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 02:27:59
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/View.tsx
 */
import CustomMarkdown from '@chatgpt/components/Markdown';
import { ConversationTemplate } from '@chatgpt/types/conversation_template';
import {
  Avatar,
  Box,
  Divider,
  FormLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { Details, DetailsItem } from 'details';
import React, { useMemo } from 'react';
import system from '@chatgpt/assets/system.png';
import assistant from '@chatgpt/assets/assistant.jpg';
import user from '@chatgpt/assets/user.jpg';
import { Role } from '@chatgpt/types/common';
import { format } from 'time';

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
          let avatar = user;
          switch (prompt.role) {
            case Role.user:
              avatar = user;
              break;
            case Role.assistant:
              avatar = assistant;
              break;
            case Role.system:
              avatar = system;
              break;
          }
          return (
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
