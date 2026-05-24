import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  loading: false,
  errors: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.errors = {}
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
      state.errors = {};
    },
    setErrors: (state, action) => {
      state.errors = action.payload;
      state.loading = false;
    },
    clearErrors: (state) => {
      state.errors = null;
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      state.users[index] = action.payload;
    },
    removeUser: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  }
})

export const {
  setLoading,
  setUsers,
  setErrors,
  clearErrors,
  updateUser,
  removeUser
} = usersSlice.actions;

export default usersSlice.reducer;