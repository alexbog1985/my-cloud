import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const { id, message, type, duration } = action.payload;
      state.notifications.push({ id, message, type, duration });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
