import { CustomTheme } from 'theme';
import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
function App() {
  return (
    <CustomTheme>
      <SnackbarProvider>
        <BrowserRouter>111</BrowserRouter>
      </SnackbarProvider>
    </CustomTheme>
  );
}

export default App;
