/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 06:00:04
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 00:43:42
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/header.tsx
 */
import { PromiseData } from '@chatgpt/hooks/usePromise';
import { ConversationTemplate } from '@chatgpt/types/conversation_template';
import { Delete, Edit, Preview, Refresh, Save } from '@mui/icons-material';
import { Avatar, Box, IconButton, Skeleton, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useMemo } from 'react';
import { Alignment } from '@chatgpt/features/MessagePreview/Success';
import { deleteConversationTemplate } from '@chatgpt/service/chat/mutation';
import { enqueueSnackbar } from 'notify';

export interface TemplateDetailHeaderProps {
  refresh: () => void;
  data: PromiseData<ConversationTemplate>;
  alignment: Alignment;
  handleAlignment: (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => void;
  formId: string;
}

export default function TemplateDetailHeader({
  data: { tag, value },
  refresh,
  alignment,
  handleAlignment,
  formId,
}: TemplateDetailHeaderProps) {
  const navigate = useNavigate();
  const content = useMemo(() => {
    switch (tag) {
      case 'loading':
        return (
          <>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
          </>
        );
      case 'error':
        return (
          <Typography data-tauri-drag-region variant="h6" component="span" paragraph={false}>
            Conversation Templates
          </Typography>
        );
      case 'data':
        return (
          <>
            <Typography data-tauri-drag-region variant="h6" component="span" paragraph={false}>
              Conversation Templates
            </Typography>
            <Avatar data-tauri-drag-region sx={{ backgroundColor: 'transparent' }}>
              {value.icon}
            </Avatar>
            <Typography
              sx={{ ml: 1 }}
              data-tauri-drag-region
              variant="body2"
              color="inherit"
              component="span"
              paragraph={false}
            >
              {value.name}
            </Typography>
          </>
        );
      default:
        return (
          <Typography data-tauri-drag-region variant="h6" component="span" paragraph={false}>
            Conversation Templates
          </Typography>
        );
    }
  }, [tag, value]);
  const deleteButton = useMemo(() => {
    switch (tag) {
      case 'data':
        const handleDelete = async () => {
          deleteConversationTemplate({ id: value.id });
          navigate(-1);
          enqueueSnackbar('Conversation template deleted', { variant: 'success' });
        };
        return (
          <Tooltip title="Delete">
            <IconButton onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Tooltip>
        );
      default:
        return null;
    }
  }, [tag, value]);
  const submitButton = useMemo(() => {
    switch (tag) {
      case 'data':
        switch (alignment) {
          case Alignment.edit:
            return (
              <Tooltip title="Save">
                <IconButton type="submit" form={formId}>
                  <Save />
                </IconButton>
              </Tooltip>
            );
          default:
            return null;
        }
      default:
        return null;
    }
  }, [tag, value, formId, alignment]);
  return (
    <Box
      data-tauri-drag-region
      sx={{
        width: '100%',
        display: 'flex',
        p: 1,
        justifyContent: 'center',
        boxShadow: (theme) => theme.shadows[3].split(',0px')[0],
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }} data-tauri-drag-region>
        <IconButton sx={{ mr: 1 }} onClick={() => navigate(-1)}>
          <KeyboardArrowLeftIcon />
        </IconButton>
        {content}
      </Box>
      <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment}>
        <ToggleButton value={Alignment.preview}>
          <Preview />
        </ToggleButton>
        <ToggleButton value={Alignment.edit}>
          <Edit />
        </ToggleButton>
      </ToggleButtonGroup>
      <Box>
        <IconButton disabled={tag === 'loading'} onClick={refresh}>
          <Refresh />
        </IconButton>
        {deleteButton}
        {submitButton}
      </Box>
    </Box>
  );
}
