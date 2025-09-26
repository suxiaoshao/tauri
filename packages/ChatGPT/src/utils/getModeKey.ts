import { Mode } from '@chatgpt/types/common';
import { match } from 'ts-pattern';

export function getModeKey(mode: Mode) {
  return match(mode)
    .with(Mode.AssistantOnly, () => 'assistant_only')
    .with(Mode.Contextual, () => 'Contextual')
    .with(Mode.Single, () => 'Single')
    .exhaustive();
}
