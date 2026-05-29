import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import filesReducer from './slices/filesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    files: filesReducer,
  },

})

export default store;