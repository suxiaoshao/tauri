/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:29:49
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/ConversationHeader/ExportConversation.tsx
 */
import { Conversation } from '@chatgpt/types/conversation';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ExportConversationParams, ExportType, exportConversation } from '@chatgpt/service/chat/mutation';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { dialog } from '@tauri-apps/api';
import { enqueueSnackbar } from 'notify';

export interface ExportConversationProps {
  conversation: Conversation;
}
async function selectFolder() {
  const result = await dialog.open({
    directory: true, // 设置为 true 以允许目录选择
    // 其他可选属性...
  });
  return result as string;
}

export default function ExportConversation({ conversation }: ExportConversationProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const { control, handleSubmit } = useForm<Pick<ExportConversationParams, 'exportType'>>({});
  const onSubmit = useCallback(
    async ({ exportType }: Pick<ExportConversationParams, 'exportType'>) => {
      const path = await selectFolder();
      await exportConversation({ path, exportType, id: conversation.id });
      dispatch(fetchConversations());
      handleClose();
      await enqueueSnackbar('Exported successfully', { variant: 'success' });
    },
    [conversation.id, dispatch, handleClose],
  );
  return (
    <>
      <Tooltip title="Export">
        <IconButton onClick={handleOpen}>
          <IosShareIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        open={open}
        onClose={handleClose}
        fullWidth
        sx={{
          height: '500px',
          '& .MuiDialog-paper': {
            backgroundColor: (theme) => theme.palette.background.paper + 'a0',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>Export Messages</DialogTitle>
        <DialogContent>
          <Controller
            control={control}
            name="exportType"
            rules={{ required: true }}
            render={({ field }) => (
              <TextField sx={{ mt: 2 }} label="Export Type" fullWidth select {...field} required>
                <MenuItem value={ExportType.JSON}>{ExportType.JSON}</MenuItem>
                <MenuItem value={ExportType.CSV}>{ExportType.CSV}</MenuItem>
                <MenuItem value={ExportType.TXT}>{ExportType.TXT}</MenuItem>
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" type="submit">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
