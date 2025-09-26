import { SnackbarProvider } from 'notify';
import { RouterProvider } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { CustomTheme } from './features/Theme';
import I18next from './features/i18n';

function App() {
  return (
    <I18next>
      <CustomTheme>
        <SnackbarProvider>
          <RouterProvider router={AppRouter} />
        </SnackbarProvider>
      </CustomTheme>
    </I18next>
  );
}

export default App;
