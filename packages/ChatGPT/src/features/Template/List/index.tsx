/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:49
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:19:24
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/index.tsx
 */
import { Apps } from '@mui/icons-material';
import { Avatar, Box, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import TemplateInfo from '../components/TemplateInfo';
import { selectTemplates, useTemplateStore } from '../templateSlice';
import TemplateListHeader from './components/Header';

function ConversationTemplateList() {
  const templates = useTemplateStore(useShallow(selectTemplates));
  const navigate = useNavigate();
  const handleClick = useCallback(
    (templateId: number) => {
      navigate(`/template/${templateId}`);
    },
    [navigate],
  );
  const content = useMemo(
    () => (
      <List sx={{ flex: '1 1 0', overflowY: 'auto' }}>
        {templates.map(({ id, icon, description, mode, name }) => (
          <ListItemButton key={id} onClick={() => handleClick(id)}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'transparent' }}>{icon}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={name} secondary={<TemplateInfo description={description} mode={mode} />} />
          </ListItemButton>
        ))}
      </List>
    ),
    [templates, handleClick],
  );
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <TemplateListHeader />
      {content}
    </Box>
  );
}

function TemplateItem() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const matchAdd = useMatch('/template');
  const match = useMemo(() => pathname.startsWith('/template'), [pathname]);
  return (
    <ListItemButton
      onClick={() => {
        if (matchAdd) {
          navigate('/');
        } else {
          navigate('/template');
        }
      }}
      selected={match}
    >
      <ListItemIcon>
        <Apps />
      </ListItemIcon>
      <ListItemText primary="Templates" />
    </ListItemButton>
  );
}

ConversationTemplateList.Item = TemplateItem;

export default ConversationTemplateList;
