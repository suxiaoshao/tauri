import { Box } from '@mui/material';

export interface ToolBarProps {
  children: React.ReactNode;
}
export default function ToolBar({ children }: ToolBarProps) {
  return <Box sx={{ mr: 2, mt: 3 }}>{children}</Box>;
}
