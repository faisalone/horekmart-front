'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// Types
export interface CartItem {
  id: string; // Unique identifier for cart item
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number; // Original price before discount/offer
  weight?: number; // Product weight in kg
  weightUnit?: string; // Weight unit (kg, g)
  productName: string;
  productImage?: string;
  productSlug?: string;
  categorySlug?: string;
  variantOptions?: Record<string, string>; // e.g., { Size: "M", Color: "Red" }
  sku?: string;
  maxQuantity?: number;
  addedAt: Date;
  isDirectBuy?: boolean; // Flag for "Order Now" items
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_VARIANT'; payload: { id: string; variantId: string; variantOptions: Record<string, string>; price: number; originalPrice?: number; sku: string; maxQuantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CLEAR_DIRECT_BUY_ITEMS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
};

// Utility functions
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

const generateCartItemId = (productId: string, variantId?: string): string => {
  return variantId ? `${productId}-${variantId}` : productId;
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const cartItemId = generateCartItemId(action.payload.productId, action.payload.variantId);
      const existingItemIndex = state.items.findIndex(item => item.id === cartItemId);

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex];
        const newQuantity = existingItem.quantity + action.payload.quantity;
        const maxQuantity = action.payload.maxQuantity || 999;

        if (newQuantity > maxQuantity) {
          toast.error(`Maximum quantity available: ${maxQuantity}`);
          return state;
        }

        newItems = state.items.map((item, index) =>
          index === existingItemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          ...action.payload,
          id: cartItemId,
          addedAt: new Date(),
        };
        newItems = [...state.items, newItem];
      }

      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id: action.payload.id } });
      }

      const newItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const maxQuantity = item.maxQuantity || 999;
          const newQuantity = Math.min(action.payload.quantity, maxQuantity);
          
          if (newQuantity < action.payload.quantity) {
            toast.error(`Maximum quantity available: ${maxQuantity}`);
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'UPDATE_VARIANT': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          // Generate new ID based on product and new variant
          const newId = generateCartItemId(item.productId, action.payload.variantId);
          
          // If the new ID is different from current ID, we need to check if it already exists
          const existingItemWithNewId = state.items.find(existingItem => existingItem.id === newId && existingItem.id !== item.id);
          
          if (existingItemWithNewId) {
            // If an item with the new variant already exists, merge quantities
            toast.success('Variant updated - quantities merged');
            return null; // Will be filtered out
          }
          
          return {
            ...item,
            id: newId,
            variantId: action.payload.variantId,
            variantOptions: action.payload.variantOptions,
            price: action.payload.price,
            originalPrice: action.payload.originalPrice,
            sku: action.payload.sku,
            maxQuantity: action.payload.maxQuantity,
          };
        }
        return item;
      }).filter(item => item !== null) as CartItem[];

      // Handle merging if needed
      const itemToUpdate = state.items.find(item => item.id === action.payload.id);
      if (itemToUpdate) {
        const newId = generateCartItemId(itemToUpdate.productId, action.payload.variantId);
        const existingItemWithNewId = state.items.find(existingItem => existingItem.id === newId && existingItem.id !== itemToUpdate.id);
        
        if (existingItemWithNewId) {
          // Merge quantities
          const mergedItems = newItems.map(item => {
            if (item.id === newId) {
              return {
                ...item,
                quantity: item.quantity + itemToUpdate.quantity
              };
            }
            return item;
          });
          
          const totals = calculateTotals(mergedItems);
          return {
            ...state,
            items: mergedItems,
            ...totals,
          };
        }
      }

      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }

    case 'CLEAR_DIRECT_BUY_ITEMS': {
      const newItems = state.items.filter(item => !item.isDirectBuy);
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        ...totals,
        isLoading: false,
      };
    }

    default:
      return state;
  }
};

// Context
interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateVariant: (id: string, variantId: string, variantOptions: Record<string, string>, price: number, originalPrice: number | undefined, sku: string, maxQuantity: number) => void;
  clearCart: () => void;
  clearDirectBuyItems: () => void;
  getCartItem: (productId: string, variantId?: string) => CartItem | undefined;
  isItemInCart: (productId: string, variantId?: string) => boolean;
  getItemQuantity: (productId: string, variantId?: string) => number;
  getRegularCartItems: () => CartItem[];
  getDirectBuyItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Convert date strings back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'LOAD_CART', payload: cartWithDates });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('shopping-cart', JSON.stringify(state.items));
    }
  }, [state.items, state.isLoading]);

  // Actions
  const addItem = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${item.productName} added to cart!`);
  }, []);

  const removeItem = useCallback((id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    if (item) {
      toast.success(`${item.productName} removed from cart`);
    }
  }, [state.items]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const updateVariant = useCallback((id: string, variantId: string, variantOptions: Record<string, string>, price: number, originalPrice: number | undefined, sku: string, maxQuantity: number) => {
    dispatch({ type: 'UPDATE_VARIANT', payload: { id, variantId, variantOptions, price, originalPrice, sku, maxQuantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  }, []);

  const clearDirectBuyItems = useCallback(() => {
    dispatch({ type: 'CLEAR_DIRECT_BUY_ITEMS' });
  }, []);

  const getCartItem = useCallback((productId: string, variantId?: string): CartItem | undefined => {
    const id = generateCartItemId(productId, variantId);
    return state.items.find(item => item.id === id);
  }, [state.items]);

  const isItemInCart = useCallback((productId: string, variantId?: string): boolean => {
    return getCartItem(productId, variantId) !== undefined;
  }, [getCartItem]);

  const getItemQuantity = useCallback((productId: string, variantId?: string): number => {
    const item = getCartItem(productId, variantId);
    return item ? item.quantity : 0;
  }, [getCartItem]);

  const getRegularCartItems = useCallback((): CartItem[] => {
    return state.items.filter(item => !item.isDirectBuy);
  }, [state.items]);

  const getDirectBuyItems = useCallback((): CartItem[] => {
    return state.items.filter(item => item.isDirectBuy);
  }, [state.items]);

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    updateVariant,
    clearCart,
    clearDirectBuyItems,
    getCartItem,
    isItemInCart,
    getItemQuantity,
    getRegularCartItems,
    getDirectBuyItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
