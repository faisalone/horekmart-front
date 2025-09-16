'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PageTitleContextType {
  setPageTitle: (title: string | null) => void;
  pageTitle: string | null;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

interface PageTitleProviderProps {
  children: React.ReactNode;
  baseName?: string;
}

export function PageTitleProvider({ children, baseName = 'Horekmart' }: PageTitleProviderProps) {
  const [pageTitle, setPageTitleState] = useState<string | null>(null);

  const setPageTitle = (title: string | null) => {
    setPageTitleState(title);
  };

  // Update document title whenever pageTitle changes
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} - ${baseName}`;
    } else {
      document.title = baseName;
    }
  }, [pageTitle, baseName]);

  return (
    <PageTitleContext.Provider value={{ setPageTitle, pageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
}

// Custom hook for easier usage - automatically cleans up on unmount
export function useSetPageTitle(title: string | null) {
  const { setPageTitle } = usePageTitle();
  
  useEffect(() => {
    setPageTitle(title);
    
    // Cleanup: reset to null when component unmounts
    return () => {
      setPageTitle(null);
    };
  }, [title, setPageTitle]);
}