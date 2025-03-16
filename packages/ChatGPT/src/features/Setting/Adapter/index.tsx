import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAdapterSettingInputs, type InputItem } from '@chatgpt/service/adapter';
import { match } from 'ts-pattern';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import { Box, Divider, FormLabel, IconButton, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import type { Config } from '../types';
import { Add, Delete } from '@mui/icons-material';
import NumberField from '@chatgpt/components/NumberField';

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
            {inputs.map((input) => (
              <InputItemForm inputItem={input} prefixName={name} />
            ))}
            <Divider />
          </Box>
        ))}
      </Box>
    ))
    .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  return content;
}

function InputItemForm({ inputItem, prefixName }: { inputItem: InputItem; prefixName: string }) {
  const { register, control } = useFormContext<Config>();
  return match(inputItem.inputType)
    .with({ tag: 'text' }, () => (
      <TextField
        fullWidth
        required={inputItem.required}
        label={inputItem.name}
        {...register(`adapterSettings.${prefixName}.${inputItem.id}`)}
      />
    ))
    .with({ tag: 'integer' }, () => (
      <NumberField
        fullWidth
        required={inputItem.required}
        label={inputItem.name}
        slotProps={{
          htmlInput: {
            step: 1,
          },
        }}
        {...register(`adapterSettings.${prefixName}.${inputItem.id}`, { valueAsNumber: true })}
      />
    ))
    .with({ tag: 'float' }, () => (
      <NumberField
        fullWidth
        required={inputItem.required}
        label={inputItem.name}
        slotProps={{
          htmlInput: {
            step: 0.01,
          },
        }}
        {...register(`adapterSettings.${prefixName}.${inputItem.id}`, { valueAsNumber: true })}
      />
    ))
    .with({ tag: 'select' }, (value) => (
      <Controller
        control={control}
        name={`adapterSettings.${prefixName}.${inputItem.id}`}
        rules={{ required: inputItem.required }}
        render={({ field }) => (
          <TextField select label={inputItem.name} required={inputItem.required} fullWidth {...field}>
            {value.value.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    ))
    .with({ tag: 'array' }, ({ value }) => <ArrayField {...inputItem} prefixName={prefixName} inputItem={value} />)
    .otherwise(() => null);
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
