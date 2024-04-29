/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:49
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 22:11:43
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/index.tsx
 */
import usePromise from '@chatgpt/hooks/usePromise';
import { allConversationTemplates } from '@chatgpt/service/chat';
import { Apps } from '@mui/icons-material';
import { Avatar, Box, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import TemplateListHeader from './components/Header';
import { useCallback, useMemo } from 'react';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
function ConversationTemplateList() {
  const [data, refresh] = usePromise(allConversationTemplates);
  const navigate = useNavigate();
  const handleClick = useCallback(
    (templateId: number) => {
      navigate(`/template/${templateId}`);
    },
    [navigate],
  );
  const content = useMemo(() => {
    switch (data.tag) {
      case 'loading':
        return <Loading sx={{ width: '100%', height: '100%' }} />;
      case 'error':
        return <ErrorInfo sx={{ flex: '1 1 0' }} error={data.value} refetch={refresh} />;
      case 'data':
        return (
          <List sx={{ flex: '1 1 0', overflowY: 'auto' }}>
            {data.value.map((template) => (
              <ListItemButton key={template.id} onClick={() => handleClick(template.id)}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent' }}>{template.icon}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={template.name} secondary={template.mode} />
              </ListItemButton>
            ))}
          </List>
        );
      default:
        return <Loading sx={{ width: '100%', height: '100%' }} />;
    }
  }, [data]);
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
      <TemplateListHeader data={data} refresh={refresh} />
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
