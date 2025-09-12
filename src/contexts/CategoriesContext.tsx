'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '@/types';
import { publicApi } from '@/lib/public-api';

interface CategoriesContextType {
  categories: Category[];
  parentCategories: Category[];
  loading: boolean;
  error: string | null;
  refetchCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

interface CategoriesProviderProps {
  children: React.ReactNode;
}

export const CategoriesProvider: React.FC<CategoriesProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await publicApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Derive parent categories from all categories
  const parentCategories = categories.filter(category => category.parent_id === null);

  const value = {
    categories,
    parentCategories,
    loading,
    error,
    refetchCategories: fetchCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
