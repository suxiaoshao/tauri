import { Role } from '@chatgpt/types/common';
import { match } from 'ts-pattern';

export function getRoleKey(role: Role) {
  return match(role)
    .with(Role.developer, () => 'developer')
    .with(Role.user, () => 'user')
    .with(Role.assistant, () => 'assistant')
    .exhaustive();
}
