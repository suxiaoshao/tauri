import { CustomTheme } from 'theme';
import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
function App() {
  return (
    <CustomTheme>
      <SnackbarProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </SnackbarProvider>
    </CustomTheme>
  );
}

export default App;
