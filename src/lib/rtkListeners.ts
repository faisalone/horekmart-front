import { setupListeners } from '@reduxjs/toolkit/query';
import { store } from './store';

// Optional: enable refetchOnFocus/refetchOnReconnect for RTK Query
setupListeners(store.dispatch);
