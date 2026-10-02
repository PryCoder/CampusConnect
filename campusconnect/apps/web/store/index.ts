import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import collegesReducer from './slices/collegesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    colleges: collegesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;