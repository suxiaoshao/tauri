import { Box } from '@mui/material';

export interface ToolBarProps {
  children: React.ReactNode;
}
export default function ToolBar({ children }: ToolBarProps) {
  return (
    <Box
      data-toolbar
      sx={{
        display: 'none',
      }}
    >
      {children}
    </Box>
  );
}
