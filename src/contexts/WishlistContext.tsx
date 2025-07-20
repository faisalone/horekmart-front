'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// Types
export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  productSlug?: string;
  categorySlug?: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
  addedAt: Date;
}

export interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
  isLoading: boolean;
}

export type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Omit<WishlistItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

// Initial state
const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  isLoading: false,
};

// Wishlist reducer
const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      
      if (existingItem) {
        toast('Item already in wishlist', { icon: 'ℹ️' });
        return state;
      }

      const newItem: WishlistItem = {
        ...action.payload,
        id: action.payload.productId,
        addedAt: new Date(),
      };

      return {
        ...state,
        items: [...state.items, newItem],
        totalItems: state.totalItems + 1,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      };
    }

    case 'CLEAR_WISHLIST': {
      return {
        ...state,
        items: [],
        totalItems: 0,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'LOAD_WISHLIST': {
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.length,
        isLoading: false,
      };
    }

    default:
      return state;
  }
};

// Context
interface WishlistContextType {
  state: WishlistState;
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isItemInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Provider
interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Convert date strings back to Date objects
        const wishlistWithDates = parsedWishlist.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'LOAD_WISHLIST', payload: wishlistWithDates });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }, [state.items, state.isLoading]);

  // Actions
  const addItem = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${item.productName} added to wishlist!`);
  };

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    if (item) {
      toast.success(`${item.productName} removed from wishlist`);
    }
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    toast.success('Wishlist cleared');
  };

  const isItemInWishlist = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  const toggleItem = (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    if (isItemInWishlist(item.productId)) {
      removeItem(item.productId);
    } else {
      addItem(item);
    }
  };

  const value: WishlistContextType = {
    state,
    addItem,
    removeItem,
    clearWishlist,
    isItemInWishlist,
    toggleItem,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
