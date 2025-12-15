import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import init from './utils/init';
import './index.css';

async function main() {
  await init();
  ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
    // eslint-disable-next-line label-has-associated-control
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

main();
