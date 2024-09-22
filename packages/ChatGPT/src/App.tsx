import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { CustomTheme } from './features/Theme';

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
