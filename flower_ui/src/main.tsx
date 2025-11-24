import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import App from './App';
import './index.css';
import luxuryTheme from './theme/luxuryTheme';
import ErrorBoundary from './components/common/ErrorBoundary';
import { logger } from './utils/logger';

// 全局错误捕获
window.addEventListener('error', (event) => {
  logger.error('Global error captured', event.error, event);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', event.reason, event);
  event.preventDefault();
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <ErrorBoundary>
    <React.StrictMode>
      <ThemeProvider theme={luxuryTheme}>
        <CssBaseline />
        <BrowserRouter future={{ v7_startTransition: true }}>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
