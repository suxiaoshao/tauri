/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:43
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 22:23:14
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/index.tsx
 */
import usePromise from '@chatgpt/hooks/usePromise';
import { findConversationTemplate } from '@chatgpt/service/chat';
import { Box } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import TemplateDetailHeader from './components/Header';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import TemplateDetailEdit from './components/Edit';
import { Alignment } from '@chatgpt/features/MessagePreview/Success';
import TemplateDetailView from './components/View';

export default function ConversationTemplateDetail() {
  const [alignment, setAlignment] = useState(Alignment.preview);
  const handleAlignment = useCallback((event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    switch (newAlignment) {
      case Alignment.preview:
        setAlignment(Alignment.preview);
        break;
      case Alignment.edit:
        setAlignment(Alignment.edit);
        break;
      default:
        setAlignment(Alignment.preview);
        break;
    }
  }, []);

  // fetch template detail
  const { id } = useParams<{ id: string }>();
  const fn = useCallback(async () => {
    if (!id) {
      throw new Error('id is empty');
    }
    const templateId = parseInt(id);
    // Fetch template detail
    const template = await findConversationTemplate({ id: templateId });
    return template;
  }, [id]);
  const [data, refresh] = usePromise(fn);

  // render content
  const content: JSX.Element = useMemo(() => {
    switch (data.tag) {
      case 'loading':
        return <Loading sx={{ width: '100%', height: '100%' }} />;
      case 'error':
        return <ErrorInfo sx={{ flex: '1 1 0' }} error={data.value} refetch={refresh} />;
      case 'data':
        switch (alignment) {
          case Alignment.preview:
            return <TemplateDetailView data={data.value} />;
          case Alignment.edit:
            return <TemplateDetailEdit data={data.value} />;
        }
      default:
        return <Loading sx={{ width: '100%', height: '100%' }} />;
    }
  }, [data, refresh, alignment]);
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
      <TemplateDetailHeader alignment={alignment} handleAlignment={handleAlignment} data={data} refresh={refresh} />
      {content}
    </Box>
  );
}
