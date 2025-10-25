import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { useListenColorMode } from './features/theme';
function App() {
  useListenColorMode();
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;
