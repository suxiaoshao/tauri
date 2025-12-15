import HotkeyInput from '@chatgpt/components/HotkeyInput';
import { Controller, useFormContext } from 'react-hook-form';
import { match } from 'ts-pattern';
import { type Config, Language, Theme } from '../types';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@chatgpt/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@chatgpt/components/ui/select';
import { Input } from '@chatgpt/components/ui/input';

export default function GeneralSettings() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<Config>();
  const { t } = useTranslation();
  return (
    <FieldSet className="h-full p-3 flex-[1_1_auto] overflow-y-auto">
      <FieldGroup>
        <Controller
          control={control}
          name="theme.theme"
          rules={{ required: true }}
          render={({ field: { onChange, ...field }, fieldState }) => (
            <Field>
              <FieldLabel>{t('theme')}</FieldLabel>
              <Select required onValueChange={onChange} {...field}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Theme.Dark}>{t(Theme.Dark)}</SelectItem>
                  <SelectItem value={Theme.Light}>{t(Theme.Light)}</SelectItem>
                  <SelectItem value={Theme.System}>{t(Theme.System)}</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <FieldLabel>{t('color')}</FieldLabel>
          <Input type="color" {...register('theme.color', { required: true })} />
          <FieldError errors={[errors.theme?.color]} />
        </Field>
        <Controller
          control={control}
          name="language"
          rules={{ required: true }}
          render={({ field: { onChange, ...field }, fieldState }) => (
            <Field>
              <FieldLabel>{t('language')}</FieldLabel>
              <Select required onValueChange={onChange} {...field}>
                <SelectTrigger>
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.System}>{t(Language.System)}</SelectItem>
                  <SelectItem value={Language.Chinese}>{t(Language.Chinese)}</SelectItem>
                  <SelectItem value={Language.English}>{t(Language.English)}</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <FieldLabel>{t('http_proxy')}</FieldLabel>
          <Input
            placeholder={t('http_proxy')}
            {...register('httpProxy', {
              setValueAs: (value) => {
                return (
                  match(value?.trim())
                    // eslint-disable-next-line no-useless-undefined
                    .with('', () => undefined)
                    .otherwise(() => value)
                );
              },
            })}
          />
          <FieldError errors={[errors.httpProxy]} />
        </Field>
        <Controller
          control={control}
          name="temporaryHotkey"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('temporary_conversation_hotkey')}</FieldLabel>
              <HotkeyInput {...field} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}
