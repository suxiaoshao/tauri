/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 06:00:04
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:14:09
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/header.tsx
 */
import { Alignment } from '@chatgpt/features/MessagePreview/Success';
import { type PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import { deleteConversationTemplate } from '@chatgpt/service/chat/mutation';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { Delete, Edit, Preview, Refresh, Save } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Avatar, Box, IconButton, Skeleton, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notify';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { match } from 'ts-pattern';

export interface TemplateDetailHeaderProps {
  refresh: () => void;
  data: PromiseData<ConversationTemplate>;
  alignment: Alignment;
  handleAlignment: (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => void;
  formId: string;
}

export default function TemplateDetailHeader({
  data,
  refresh,
  alignment,
  handleAlignment,
  formId,
}: TemplateDetailHeaderProps) {
  const navigate = useNavigate();
  const content = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.loading }, () => (
        <>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        </>
      ))
      .with({ tag: PromiseStatus.error }, () => (
        <Typography data-tauri-drag-region variant="h6" component="span">
          Conversation Templates
        </Typography>
      ))
      .with({ tag: PromiseStatus.data }, ({ value }) => (
        <>
          <Typography data-tauri-drag-region variant="h6" component="span">
            Conversation Templates
          </Typography>
          <Avatar data-tauri-drag-region sx={{ backgroundColor: 'transparent' }}>
            {value.icon}
          </Avatar>
          <Typography sx={{ ml: 1 }} data-tauri-drag-region variant="body2" color="inherit" component="span">
            {value.name}
          </Typography>
        </>
      ))
      .otherwise(() => (
        <Typography data-tauri-drag-region variant="h6" component="span">
          Conversation Templates
        </Typography>
      ));
  }, [data]);
  const deleteButton = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.data }, ({ value }) => {
        const handleDelete = async () => {
          await deleteConversationTemplate({ id: value.id });
          navigate('/template');
          enqueueSnackbar('Conversation template deleted', { variant: 'success' });
        };
        return (
          <Tooltip title="Delete">
            <IconButton onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Tooltip>
        );
      })
      .otherwise(() => null);
  }, [data, navigate]);
  const submitButton = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.data }, () => {
        return match(alignment)
          .with(Alignment.edit, () => (
            <Tooltip title="Save">
              <IconButton type="submit" form={formId}>
                <Save />
              </IconButton>
            </Tooltip>
          ))
          .otherwise(() => null);
      })
      .otherwise(() => null);
  }, [data, formId, alignment]);
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
        <IconButton disabled={data.tag === 'loading'} onClick={refresh}>
          <Refresh />
        </IconButton>
        {deleteButton}
        {submitButton}
      </Box>
    </Box>
  );
}
