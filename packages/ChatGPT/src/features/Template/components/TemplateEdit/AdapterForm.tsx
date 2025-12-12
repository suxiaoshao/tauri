import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import { InputItemForm } from '@chatgpt/features/Setting/Adapter';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAllAdapterTemplateInputs } from '@chatgpt/service/adapter';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { match } from 'ts-pattern';
import type { TemplateForm } from '.';
import { useTranslation } from 'react-i18next';
import { Fragment } from 'react/jsx-runtime';
import { Field, FieldError, FieldLabel, FieldSeparator } from '@chatgpt/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@chatgpt/components/ui/select';

export default function AdapterForm() {
  const { control } = useFormContext<TemplateForm>();
  const adapterName = useWatch({
    control,
    name: 'adapter',
  });
  const [data, fn] = usePromise(getAllAdapterTemplateInputs);
  const { t } = useTranslation();

  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading className="size-full" />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value }) => (
      <Fragment>
        <Controller
          control={control}
          name="adapter"
          rules={{ required: true }}
          render={({ field: { onChange, ...field }, fieldState }) => (
            <Field>
              <FieldLabel>{t('adapter')}</FieldLabel>
              <Select onValueChange={onChange} {...field}>
                <SelectTrigger>
                  <SelectValue placeholder={t('adapter')} />
                </SelectTrigger>
                <SelectContent>
                  {value.map(({ name }) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {value
          .find(({ name }) => name === adapterName)
          ?.inputs.map((input) => (
            <InputItemForm key={input.id} inputItem={input} prefixName="template" />
          ))}
        <FieldSeparator />
      </Fragment>
    ))
    .otherwise(() => <Loading className="size-full" />);
  return content;
}
