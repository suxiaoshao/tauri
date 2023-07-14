import { CustomTheme } from 'theme';
import { SnackbarProvider } from 'notify';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { Provider } from 'react-redux';
import store from './app/store';
function App() {
  return (
    <Provider store={store}>
      <CustomTheme>
        <SnackbarProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </SnackbarProvider>
      </CustomTheme>
    </Provider>
  );
}

export default App;
