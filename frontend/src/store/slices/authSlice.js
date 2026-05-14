import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  errors: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.errors = {};
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.errors = {};
    },
    setErrors: (state, action) => {
      state.errors = action.payload;
      state.loading = false;
      state.isAuthenticated = false;
    },
    clearErrors: (state) => {
      state.errors = {};
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.errors = {};
      localStorage.removeItem('token');
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    }
  }
});

export const {
  setUser,
  logout,
  setErrors,
  setLoading,
  setToken,
  clearErrors,
  updateToken,
} = authSlice.actions;

export default authSlice.reducer;