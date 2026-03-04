import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UserProvider } from './context/UserContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Error boundary for better debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found!');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <UserProvider>
          <App />
        </UserProvider>
      </ErrorBoundary>
    </StrictMode>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error Loading App</h1>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
      <pre>${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}
