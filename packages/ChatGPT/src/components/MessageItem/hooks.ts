import assistant from '@chatgpt/assets/assistant.jpg';
import user from '@chatgpt/assets/user.jpg';
import { Role } from '@chatgpt/types/common';
import { Theme } from '@mui/material';
import { useMemo } from 'react';
import { match } from 'ts-pattern';

export interface UseRoleDataReturn {
  logo: string;
  backgroundColor: (theme: Theme) => string;
}

export function useRoleData(role: Role): UseRoleDataReturn {
  return useMemo(() => {
    return match(role)
      .with(Role.assistant, () => ({
        logo: assistant,
        backgroundColor: (theme: Theme) => theme.palette.primary.main + '20',
      }))
      .with(Role.system, Role.user, () => ({
        logo: user,
        backgroundColor: (theme: Theme) => theme.palette.secondary.main + '20',
      }))
      .exhaustive();
  }, [role]);
}
