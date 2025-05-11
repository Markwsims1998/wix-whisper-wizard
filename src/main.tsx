
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/auth/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

const root = createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>
    <AuthProvider>
      <SubscriptionProvider>
        <App />
      </SubscriptionProvider>
    </AuthProvider>
  </BrowserRouter>
);
