import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';
import requestReducer from './slices/requestSlice';
import dashboardReducer from './slices/dashboardSlice';
import importReducer from './slices/importSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    notifications: notificationReducer,
    requests: requestReducer,
    dashboard: dashboardReducer,
    import: importReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
