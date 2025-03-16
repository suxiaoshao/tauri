import { useFieldArray, useFormContext } from 'react-hook-form';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAdapterSettingInputs, type InputItem } from '@chatgpt/service/adapter';
import { match } from 'ts-pattern';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import { Box, Divider, FormLabel, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import type { Config } from '../types';
import { Add, Delete } from '@mui/icons-material';

export default function AdapterSettings() {
  const [data, fn] = usePromise(getAdapterSettingInputs);
  const { register } = useFormContext<Config>();
  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value }) => (
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto', p: 1, gap: 1, display: 'flex', flexDirection: 'column' }}>
        {value.map(({ inputs, name }) => (
          <Box key={name} sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">{name}</Typography>
            {inputs.map((input) =>
              match(input.inputType)
                .with({ tag: 'text' }, () => (
                  <TextField
                    fullWidth
                    required={input.required}
                    label={input.name}
                    {...register(`adapterSettings.${name}.${input.id}`)}
                  />
                ))
                .with({ tag: 'array' }, ({ value }) => <ArrayField {...input} prefixName={name} inputItem={value} />)
                .otherwise(() => null),
            )}
            <Divider />
          </Box>
        ))}
      </Box>
    ))
    .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  return content;
}

function ArrayField({
  id,
  prefixName,
  name,
  required,
  inputItem,
}: InputItem & {
  prefixName: string;
  inputItem: Pick<InputItem, 'description' | 'inputType' | 'required' | 'name'>;
}) {
  const { register, control } = useFormContext<Config>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `adapterSettings.${prefixName}.${id}`,
  });
  return (
    <>
      <FormLabel required={required}>{name}</FormLabel>
      {fields.map((field, index) =>
        match(inputItem.inputType)
          .with({ tag: 'text' }, () => (
            <TextField
              key={field.id}
              required={inputItem.required}
              label={inputItem.name}
              fullWidth
              {...register(`adapterSettings.${prefixName}.${id}.${index}`)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => remove(index)}>
                        <Delete />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          ))
          .otherwise(() => null),
      )}
      <Box>
        <IconButton onClick={() => append('')}>
          <Add />
        </IconButton>
      </Box>
    </>
  );
}
