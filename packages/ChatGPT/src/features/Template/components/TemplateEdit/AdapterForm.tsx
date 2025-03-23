import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import { InputItemForm } from '@chatgpt/features/Setting/Adapter';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAllAdapterTemplateInputs } from '@chatgpt/service/adapter';
import { Box, Divider, MenuItem, TextField } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { match } from 'ts-pattern';
import type { TemplateForm } from '.';

export default function AdapterForm() {
  const { control } = useFormContext<TemplateForm>();
  const adapterName = useWatch({
    control,
    name: 'adapter',
  });
  const [data, fn] = usePromise(getAllAdapterTemplateInputs);

  // todo select adapter
  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value }) => (
      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        <Controller
          control={control}
          name="adapter"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <TextField
              error={!!fieldState?.error?.message}
              helperText={fieldState?.error?.message}
              select
              label="Adapter"
              required
              fullWidth
              {...field}
            >
              {value.map(({ name }) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {value
          .find(({ name }) => name === adapterName)
          ?.inputs.map((input) => <InputItemForm key={input.id} inputItem={input} prefixName="template" />)}
        <Divider />
      </Box>
    ))
    .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  return content;
}
