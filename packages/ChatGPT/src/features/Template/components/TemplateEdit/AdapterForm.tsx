import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import { InputItemForm } from '@chatgpt/features/Setting/Adapter';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAdapterTemplateInputs } from '@chatgpt/service/adapter';
import { Box, Divider, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { match } from 'ts-pattern';
import type { TemplateForm } from '.';

export default function AdapterForm() {
  const { control } = useFormContext<TemplateForm>();
  const adapterName = useWatch({
    control,
    name: 'adapter',
  });
  const fetchFn = useCallback(() => {
    return getAdapterTemplateInputs({ adapterName });
  }, [adapterName]);
  const [data, fn] = usePromise(fetchFn);

  // todo select adapter
  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value: { inputs, name } }) => (
      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">{name}</Typography>
        {inputs.map((input) => (
          <InputItemForm key={input.id} inputItem={input} prefixName="template" />
        ))}
        <Divider />
      </Box>
    ))
    .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  return content;
}
