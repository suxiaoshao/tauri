import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import useSettingKey from '../../hooks/useSettingKey';
import useConfig from '@chatgpt/hooks/useConfig';
import AppDrawer from '@chatgpt/features/Conversations';

const drawerWidth = 200;

export default function Headers() {
  useConfig();
  useSettingKey();

  return (
    <Box sx={{ width: '100%', height: '100%', backgroundColor: (theme) => theme.palette.background.paper + '70' }}>
      <AppDrawer open={true} drawerWidth={drawerWidth} />
      <Box
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          height: `100%`,
          marginLeft: `${drawerWidth}px`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
