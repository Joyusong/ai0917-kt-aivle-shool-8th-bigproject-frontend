import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 추가
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app/App';
import './styles/index.css';
import { ThemeProvider } from './app/components/theme-provider';

// MSW Setup
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  // Manual Override via VITE_USE_MSW
  const useMsw = import.meta.env.VITE_USE_MSW;
  if (useMsw === 'true') {
    console.log('[App] VITE_USE_MSW is true. Starting MSW...');
    const { worker } = await import('./mocks/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
  }
  if (useMsw === 'false') {
    console.log('[App] VITE_USE_MSW is false. MSW skipped.');
    return;
  }

  // Auto Mode: Check if Backend is reachable
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  try {
    // Try to reach the server with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms timeout

    await fetch(backendUrl, {
      method: 'HEAD', // Lightweight check
      mode: 'no-cors', // Avoid CORS errors during check
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('[App] Backend detected. MSW skipped.');
    return;
  } catch (error) {
    console.log('[App] Backend unreachable. Starting MSW...');
  }

  const { worker } = await import('./mocks/browser');
  // Start the worker
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn for unhandled requests (like assets)
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
});
