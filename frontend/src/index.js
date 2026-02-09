/**
 * SACO Frontend Entry Point
 * Wrapped with Chakra UI, React Query, and Toast providers
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { ToastProvider } from './components/common';
import './index.css';
import App from './App';

// Create a React Query client with default options
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <App />
                <ToastProvider />
            </QueryClientProvider>
        </ChakraProvider>
    </React.StrictMode>
);
