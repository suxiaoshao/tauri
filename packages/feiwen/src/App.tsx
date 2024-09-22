import { CustomTheme } from 'theme';
import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { Provider } from 'react-redux';
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
