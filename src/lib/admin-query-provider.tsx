'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface AdminQueryProviderProps {
  children: ReactNode;
}

export function AdminQueryProvider({ children }: AdminQueryProviderProps) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
              return false;
            }
            return failureCount < 3;
          },
        },
        mutations: {
          retry: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
