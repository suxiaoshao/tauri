import type { Content } from '@chatgpt/types/message';
import { match } from 'ts-pattern';

export function getSourceContent(content: Content): string {
  return match(content)
    .with({ tag: 'text' }, ({ value }) => value)
    .with({ tag: 'extension' }, ({ value: { source } }) => source)
    .exhaustive();
}
