import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Import from "react-dom/client"
import App from './App';
import { AuthProvider } from './components/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';

if (process.env.NODE_ENV === 'production') disableReactDevTools();

const root = ReactDOM.createRoot(document.getElementById('root')); // ✅ Use createRoot
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
