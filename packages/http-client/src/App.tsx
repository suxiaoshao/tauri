import { CustomTheme } from 'theme';
import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
import { TextField } from '@mui/material';
function App() {
  return (
    <CustomTheme>
      <SnackbarProvider>
        <BrowserRouter>
          <TextField placeholder="搜索" fullWidth />
        </BrowserRouter>
      </SnackbarProvider>
    </CustomTheme>
  );
}

export default App;
