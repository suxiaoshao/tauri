/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:43
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:26:45
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/index.tsx
 */
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { findConversationTemplate } from '@chatgpt/service/chat/query';
import { Box } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import TemplateDetailHeader from './components/Header';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import TemplateEdit, { TemplateForm } from '../components/TemplateEdit';
import { Alignment } from '@chatgpt/features/MessagePreview/Success';
import TemplateDetailView from './components/View';
import { updateConversationTemplate } from '@chatgpt/service/chat/mutation';
import { enqueueSnackbar } from 'notify';
import { match } from 'ts-pattern';

export default function ConversationTemplateDetail() {
  const [alignment, setAlignment] = useState(Alignment.preview);
  const handleAlignment = useCallback((event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    match(newAlignment)
      .with(Alignment.preview, () => setAlignment(Alignment.preview))
      .with(Alignment.edit, () => setAlignment(Alignment.edit))
      .otherwise(() => setAlignment(Alignment.preview));
  }, []);

  // fetch template detail
  const { id } = useParams<{ id: string }>();
  const fn = useCallback(async () => {
    if (!id) {
      throw new Error('id is empty');
    }
    const templateId = Number.parseInt(id, 10);
    // Fetch template detail
    const template = await findConversationTemplate({ id: templateId });
    return template;
  }, [id]);
  const [data, refresh] = usePromise(fn);

  // formId
  const formId = useMemo(() => {
    if (data.tag === 'data') {
      return `template-${data.value.id}-form`;
    }
    return '';
  }, [data]);

  // render content
  const content: JSX.Element = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
      .with({ tag: PromiseStatus.error }, ({ value }) => (
        <ErrorInfo sx={{ flex: '1 1 0' }} error={value} refetch={refresh} />
      ))
      .with({ tag: PromiseStatus.data }, ({ value }) =>
        match(alignment)
          .with(Alignment.preview, () => <TemplateDetailView data={value} />)
          .with(Alignment.edit, () => {
            const onSubmit = async (formData: TemplateForm) => {
              await updateConversationTemplate({ data: formData, id: value.id });
              enqueueSnackbar('Template updated successfully', { variant: 'success' });
              refresh();
              setAlignment(Alignment.preview);
            };
            return <TemplateEdit onSubmit={onSubmit} id={formId} initialValues={value} />;
          })
          .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />),
      )
      .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
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
      <TemplateDetailHeader
        formId={formId}
        alignment={alignment}
        handleAlignment={handleAlignment}
        data={data}
        refresh={refresh}
      />
      {content}
    </Box>
  );
}
