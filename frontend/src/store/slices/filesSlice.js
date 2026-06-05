import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [],
  loading: false,
  errors: null,
  uploadProgress: 0,
  isUploading: false,
};

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.errors = null;
    },
    clearLoading: (state) => {
      state.loading = false;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
      state.errors = null;
    },
    setErrors: (state, action) => {
      state.errors = action.payload;
      state.loading = false;
    },
    clearErrors: (state) => {
      state.errors = null;
    },
    addFile: (state, action) => {
      state.files.push(action.payload);
    },
    updateFile: (state, action) => {
      const index = state.files.findIndex(file => file.id === action.payload.id);
      if (index !== -1) {
        state.files[index] = action.payload;
      }
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(file => file.id !== action.payload);
    },
    setUploading: (state) => {
      state.isUploading = true;
      state.uploadProgress = 0;
    },
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload;
    },
    setUploadComplete(state) {
      state.isUploading = false;
      state.uploadProgress = 0;
    },
    resetUpload: (state) => {
      state.isUploading = false;
      state.uploadProgress = 0;
    }
  }
})

export const {
  setLoading,
  clearLoading,
  setFiles,
  setErrors,
  clearErrors,
  addFile,
  updateFile,
  removeFile,
  setUploading,
  setUploadProgress,
  setUploadComplete,
  resetUpload,
} = fileSlice.actions;

export default fileSlice.reducer;