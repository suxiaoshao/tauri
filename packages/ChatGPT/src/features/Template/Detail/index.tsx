/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:43
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:26:45
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/index.tsx
 */
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import { Alignment } from '@chatgpt/features/MessagePreview/Success';
import usePromise, { type PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import { updateConversationTemplate } from '@chatgpt/service/chat/mutation';
import { findConversationTemplate } from '@chatgpt/service/chat/query';
import { Box } from '@mui/material';
import { enqueueSnackbar } from 'notify';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import TemplateEdit, { type TemplateForm } from '../components/TemplateEdit';
import TemplateDetailHeader from './components/Header';
import TemplateDetailView from './components/View';
import { getAdapterTemplateInputs } from '@chatgpt/service/adapter';
import type { ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { useTranslation } from 'react-i18next';

export default function ConversationTemplateDetail() {
  const { t } = useTranslation();
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
    const inputs = await getAdapterTemplateInputs({ adapterName: template.adapter });
    return { template, inputs };
  }, [id]);
  const [data, refresh] = usePromise(fn);

  // formId
  const formId = useMemo(() => {
    if (data.tag === 'data') {
      return `template-${data.value.template.id}-form`;
    }
    return '';
  }, [data]);

  // render content
  const content = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
      .with({ tag: PromiseStatus.error }, ({ value }) => (
        <ErrorInfo sx={{ flex: '1 1 0' }} error={value} refetch={refresh} />
      ))
      .with({ tag: PromiseStatus.data }, ({ value }) =>
        match(alignment)
          .with(Alignment.preview, () => <TemplateDetailView data={value.template} inputs={value.inputs} />)
          .with(Alignment.edit, () => {
            const onSubmit = async (formData: TemplateForm) => {
              await updateConversationTemplate({ data: formData, id: value.template.id });
              enqueueSnackbar(t('template_updated_successfully'), { variant: 'success' });
              refresh();
              setAlignment(Alignment.preview);
            };
            return <TemplateEdit onSubmit={onSubmit} id={formId} initialValues={value.template} />;
          })
          .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />),
      )
      .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  }, [data, refresh, alignment, formId, t]);
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
        data={match(data)
          .with(
            { tag: PromiseStatus.data },
            ({ value }) =>
              ({ tag: PromiseStatus.data, value: value.template }) satisfies PromiseData<ConversationTemplate>,
          )
          .with(
            { tag: PromiseStatus.error },
            ({ value }) => ({ tag: PromiseStatus.error, value }) satisfies PromiseData<ConversationTemplate>,
          )
          .with(
            { tag: PromiseStatus.loading },
            () => ({ tag: PromiseStatus.loading }) satisfies PromiseData<ConversationTemplate>,
          )
          .with(
            { tag: PromiseStatus.init },
            () => ({ tag: PromiseStatus.init }) satisfies PromiseData<ConversationTemplate>,
          )
          .exhaustive()}
        refresh={refresh}
      />
      {content}
    </Box>
  );
}
