import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAllAdapterSettingInputs } from '@chatgpt/service/adapter';
import { type InputItem } from '@chatgpt/types/adapter';
import { match } from 'ts-pattern';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import NumberField from '@chatgpt/components/NumberField';
import { useState } from 'react';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@chatgpt/components/ui/field';
import { Input } from '@chatgpt/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@chatgpt/components/ui/select';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@chatgpt/components/ui/input-group';
import { XIcon } from 'lucide-react';
import { Button } from '@chatgpt/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@chatgpt/components/ui/checkbox';

export default function AdapterSettings() {
  const [data, fn] = usePromise(getAllAdapterSettingInputs);
  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading className="size-full" />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value }) => (
      <FieldGroup className="p-3 flex-[1_1_auto] overflow-y-auto">
        {value.map(({ inputs, name }, index) => (
          <FieldSet key={name}>
            <FieldLegend>{name}</FieldLegend>
            <FieldGroup>
              {inputs.map((input) => (
                <InputItemForm key={input.id} inputItem={input} prefixName={`adapterSettings.${name}`} />
              ))}
            </FieldGroup>
            {index !== value.length - 1 && <FieldSeparator />}
          </FieldSet>
        ))}
      </FieldGroup>
    ))
    .otherwise(() => <Loading className="size-full" />);
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
  const { register, control, setValue } = useFormContext();
  const formPath = `${prefixName}.${inputItem.id}`;
  const [openMaxTokens, setOpenMaxTokens] = useState(false);
  const { t } = useTranslation();
  return match(inputItem.inputType)
    .with({ tag: 'text' }, () => (
      <Field>
        <FieldLabel>{inputItem.name}</FieldLabel>
        <Input required={required} {...register(formPath, { required })} />
      </Field>
    ))
    .with({ tag: 'integer' }, ({ value }) => (
      <Field>
        <FieldLabel>{inputItem.name}</FieldLabel>
        <NumberField
          required={required}
          step={value.step}
          max={value.max}
          min={value.min}
          defaultValue={value.default}
          {...register(formPath, { valueAsNumber: true })}
        />
      </Field>
    ))
    .with({ tag: 'float' }, ({ value }) => (
      <Field>
        <FieldLabel>{inputItem.name}</FieldLabel>
        <NumberField
          required={required}
          step={value.step}
          max={value.max}
          min={value.min}
          defaultValue={value.default}
          {...register(formPath, { valueAsNumber: true })}
        />
      </Field>
    ))
    .with({ tag: 'select' }, (value) => (
      <Controller
        control={control}
        name={formPath}
        rules={{ required: required }}
        defaultValue={value.value.at(0)}
        render={({ field: { onChange, ...field }, fieldState }) => (
          <Field>
            <FieldLabel>{inputItem.name}</FieldLabel>
            <Select required={required} onValueChange={onChange} {...field}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {value.value.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    ))
    .with({ tag: 'optional' }, ({ value }) => {
      return (
        // todo optional
        <>
          <Field>
            <div className="flex items-center gap-3">
              <Checkbox
                id={`${prefixName}-${inputItem.id}`}
                checked={openMaxTokens}
                onCheckedChange={(check) => {
                  const checked = match(check)
                    .with(true, () => true)
                    .otherwise(() => false);
                  setOpenMaxTokens(checked);
                  if (!checked) {
                    setValue(formPath, null);
                  }
                }}
              />
              <FieldLabel htmlFor={`${prefixName}-${inputItem.id}`}>{t('open', { name: inputItem.name })}</FieldLabel>
            </div>
          </Field>
          {openMaxTokens && (
            <InputItemForm inputItem={{ ...inputItem, inputType: value }} prefixName={prefixName} required={false} />
          )}
        </>
      );
    })
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
  const { t } = useTranslation();
  return (
    <Field>
      <FieldLabel>{name}</FieldLabel>
      <FieldGroup className="gap-4">
        {fields.map((field, index) =>
          match(inputItem.inputType)
            .with({ tag: 'text' }, () => (
              <InputGroup key={field.id}>
                <InputGroupInput required {...register(`${prefixName}.${id}.${index}`)} />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => remove(index)}
                    aria-label={`Remove email ${index + 1}`}
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            ))
            .otherwise(() => null),
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ address: '' })}>
          {t('add', { name: name })}
        </Button>
      </FieldGroup>
    </Field>
  );
}
