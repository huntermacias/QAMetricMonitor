// app/providers/ReactQueryProvider.tsx

'use client';

import React, { ReactNode } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';


interface ReactQueryProviderProps {
  children: ReactNode;
}

const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2, // Retry failed requests twice
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate>{children}</Hydrate>
      {/* React Query Devtools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}

    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
