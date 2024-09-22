import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.querySelector('#root');
if (root) {
  ReactDOM.createRoot(root).render(
    // eslint-disable-next-line label-has-associated-control
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
