import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import filesReducer from './slices/filesSlice';
import notificationsReducer from './slices/notificationsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    files: filesReducer,
    notifications: notificationsReducer,
  },
})

export default store;