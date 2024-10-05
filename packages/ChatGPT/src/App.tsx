import { SnackbarProvider } from 'notify';
import { RouterProvider } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { CustomTheme } from './features/Theme';

function App() {
  return (
    <CustomTheme>
      <SnackbarProvider>
        <RouterProvider router={AppRouter} />
      </SnackbarProvider>
    </CustomTheme>
  );
}

export default App;
