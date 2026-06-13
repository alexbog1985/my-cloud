import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  errors: {},
};

export const logoutAction = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/logout/');
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.errors = {};
    },
    resetLoading: (state) => {
      state.loading = false;
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
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.errors = {};
        state.loading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logoutAction.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const {
  setUser,
  setErrors,
  setLoading,
  setToken,
  clearErrors,
  updateToken,
  resetLoading
} = authSlice.actions;

export default authSlice.reducer;
