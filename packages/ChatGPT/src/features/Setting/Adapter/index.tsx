import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAllAdapterSettingInputs, type InputItem } from '@chatgpt/service/adapter';
import { match } from 'ts-pattern';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import { Box, Divider, FormLabel, IconButton, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import NumberField from '@chatgpt/components/NumberField';

export default function AdapterSettings() {
  const [data, fn] = usePromise(getAllAdapterSettingInputs);
  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value }) => (
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto', p: 1, px: 2, gap: 1, display: 'flex', flexDirection: 'column' }}>
        {value.map(({ inputs, name }) => (
          <Box key={name} sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">{name}</Typography>
            {inputs.map((input) => (
              <InputItemForm key={input.id} inputItem={input} prefixName={`adapterSettings.${name}`} />
            ))}
            <Divider />
          </Box>
        ))}
      </Box>
    ))
    .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  return content;
}

export function InputItemForm({
  inputItem,
  prefixName,
  required = true,
}: {
  inputItem: InputItem;
  prefixName: string;
  required?: boolean;
}) {
  const { register, control } = useFormContext();
  return match(inputItem.inputType)
    .with({ tag: 'text' }, () => (
      <TextField fullWidth required={required} label={inputItem.name} {...register(`${prefixName}.${inputItem.id}`)} />
    ))
    .with({ tag: 'integer' }, ({ value }) => (
      <NumberField
        fullWidth
        required={required}
        label={inputItem.name}
        slotProps={{
          htmlInput: {
            step: value.step,
            max: value.max,
            min: value.min,
            defaultValue: value.default,
          },
        }}
        defaultValue={value.default}
        {...register(`${prefixName}.${inputItem.id}`, { valueAsNumber: true })}
      />
    ))
    .with({ tag: 'float' }, ({ value }) => (
      <NumberField
        fullWidth
        required={required}
        label={inputItem.name}
        slotProps={{
          htmlInput: {
            step: value.step,
            max: value.max,
            min: value.min,
            defaultValue: value.default,
          },
        }}
        defaultValue={value.default}
        {...register(`${prefixName}.${inputItem.id}`, { valueAsNumber: true })}
      />
    ))
    .with({ tag: 'select' }, (value) => (
      <Controller
        control={control}
        name={`${prefixName}.${inputItem.id}`}
        rules={{ required: required }}
        defaultValue={value.value.at(0)}
        render={({ field }) => (
          <TextField select label={inputItem.name} required={required} fullWidth {...field}>
            {value.value.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    ))
    .with({ tag: 'optional' }, ({ value }) => (
      // todo optional
      <InputItemForm inputItem={{ ...inputItem, inputType: value }} prefixName={prefixName} required={false} />
    ))
    .with({ tag: 'array' }, ({ value }) => <ArrayField {...inputItem} prefixName={prefixName} inputItem={value} />)
    .otherwise(() => null);
}

function ArrayField({
  id,
  prefixName,
  name,
  inputItem,
}: InputItem & {
  prefixName: string;
  inputItem: Pick<InputItem, 'description' | 'inputType' | 'name'>;
}) {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefixName}.${id}`,
  });
  return (
    <>
      <FormLabel>{name}</FormLabel>
      {fields.map((field, index) =>
        match(inputItem.inputType)
          .with({ tag: 'text' }, () => (
            <TextField
              key={field.id}
              required
              label={inputItem.name}
              fullWidth
              {...register(`${prefixName}.${id}.${index}`)}
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
