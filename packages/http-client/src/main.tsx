import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.querySelector('#root') ?? document.body).render(
  // eslint-disable-next-line label-has-associated-control
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
