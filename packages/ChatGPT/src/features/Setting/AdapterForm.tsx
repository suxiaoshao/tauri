import { useFormContext } from 'react-hook-form';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { getAdapterSettingInputs } from '@chatgpt/service/adapter';
import { match } from 'ts-pattern';
import Loading from '@chatgpt/components/Loading';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import { Box } from '@mui/material';

export default function AdapterFrom() {
  const [data, fn] = usePromise(getAdapterSettingInputs);
  const {} = useFormContext();
  const content = match(data)
    .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
    .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
    .with({ tag: PromiseStatus.data }, ({ value }) => <Box />)
    .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  return content;
}
