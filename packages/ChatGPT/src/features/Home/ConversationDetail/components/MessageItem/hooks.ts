import { Role } from '@chatgpt/types/common';
import { Theme } from '@mui/material';
import { useMemo } from 'react';
import assistant from '@chatgpt/assets/assistant.jpg';
import user from '@chatgpt/assets/user.jpg';

export interface UseRoleDataReturn {
  logo: string;
  backgroundColor: (theme: Theme) => string;
}

export function useRoleData(role: Role): UseRoleDataReturn {
  return useMemo(() => {
    switch (role) {
      case Role.assistant:
        return {
          logo: assistant,
          backgroundColor: (theme: Theme) => theme.palette.primary.main + '20',
        };
      case Role.system:
        return {
          logo: user,
          backgroundColor: (theme: Theme) => theme.palette.secondary.main + '20',
        };
      case Role.user:
        return {
          logo: user,
          backgroundColor: (theme: Theme) => theme.palette.secondary.main + '20',
        };
    }
  }, [role]);
}
