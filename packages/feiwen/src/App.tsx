import { CustomTheme } from './components/CustomTheme';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <CustomTheme>
        <AppRouter />
      </CustomTheme>
    </BrowserRouter>
  );
}

export default App;
