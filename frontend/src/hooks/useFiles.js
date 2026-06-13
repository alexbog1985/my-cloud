import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useApi } from "./useApi";
import { useNotifications } from "./useNotifications";
import { useApiErrorHandler } from "./useApiErrorHandler";

import {
  setLoading,
  setFiles,
  addFile,
  updateFile,
  removeFile,
  setUploading,
  setUploadProgress,
  setUploadComplete,
  resetUpload, clearLoading
} from "../store/slices/filesSlice.js";

export const useFiles = () => {
  const dispatch = useDispatch();
  const { request } = useApi();
  const { error, success } = useNotifications();
  const handleApiError = useApiErrorHandler();

  const downloadFileContent = useCallback(async (url, fileName) => {
    const response = await request({
      url,
      method: 'GET',
      responseType: "blob",
    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);

    success(`Скачивание файла: "${fileName}`);
  }, [request, success]);

  const fetchFiles = useCallback(async (userId) => {
    dispatch(setLoading());
    try {
      const url = userId ? `/api/files/?user=${userId}` : '/api/files/';
      const response = await request({
        url,
        method: 'GET',
      });
      dispatch(setFiles(response.data));
    } catch {
      dispatch(clearLoading());
    }
  }, [dispatch, request]);

  const uploadFile = useCallback(async (file, comment = '') => {
    dispatch(setUploading());

    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', comment);
    if (file.name) {
      formData.append('original_name', file.name);
    }

    try {
      const response = await request({
        url: '/api/files/',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(setUploadProgress(progress));
        }
      });

      dispatch(addFile(response.data));
      dispatch(setUploadComplete());

      success(`Файл "${file.name}" успешно загружен`)

      return response.data;
    } catch (err) {
      handleApiError(err, 'Ошибка загрузки файла')

      dispatch(resetUpload());
      throw err;
    }
  }, [dispatch, request, handleApiError, success]);

  const updateFileData = useCallback(async (fileId, data) => {
    try {
      const response = await request({
        url: `/api/files/${fileId}/`,
        method: 'PATCH',
        data: data,
      });
      dispatch(updateFile(response.data));
      return response.data;
    } catch (err) {
      handleApiError(err, 'Ошибка обновления файла:');
      throw err;
    }
  }, [dispatch, request, handleApiError]);

  const deleteFile = useCallback(async (fileId) => {

    try {
      await request({
        url: `/api/files/${fileId}/`,
        method: 'DELETE',
      });
      dispatch(removeFile(fileId));
    } catch (err) {
      handleApiError(err, 'Ошибка удаления файла:');
    }
  }, [dispatch, request, handleApiError]);

  const downloadFile = useCallback(async (fileId) => {
    try {
      const fileResponse = await request({
        url: `/api/files/${fileId}/`,
        method: 'GET',
      });

      await downloadFileContent(`/api/files/${fileId}/download/`, fileResponse.data.original_name);
    } catch (err) {
      let errorMessage = 'Ошибка скачивания файла';
      if (err.response?.data) {
        try {
          const text = await err.response.data.text();
          const data = JSON.parse(text);
          errorMessage = data.detail || data.non_field_errors?.[0] || data.error || errorMessage;
        } catch {
          errorMessage = 'Ошибка скачивания файла';
        }
      }
      error(errorMessage);
    }
  }, [request, downloadFileContent, error]);

  const copySpecialLink = useCallback(async (fileId) => {
    try {
      const response = await request({
        url: `/api/files/${fileId}/`,
        method: 'GET',
      });

      if (response.data.special_link) {
        const link = `${window.location.origin}/s/${response.data.special_link}/`;
        await navigator.clipboard.writeText(link);
        return link;
      }
    } catch (err) {
      handleApiError(err, "Ошибка получения ссылки:");
    }
  }, [request, handleApiError]);

  const downloadByLink = useCallback(async (specialLink) => {
    try {
      const fileResponse = await request({
        url: `/s/${specialLink}/`,
        method: 'GET',
        params: { info: true }
      });

      const fileName = fileResponse.data.original_name;

      await downloadFileContent(`/s/${specialLink}`, fileName);
    } catch (err) {
      error('Ошибка скачивания по ссылке: ' + (err.response?.data?.detail || ''));
      throw err;
    }
  }, [request, downloadFileContent, error]);

  return {
    fetchFiles,
    uploadFile,
    updateFile: updateFileData,
    deleteFile,
    downloadFile,
    copySpecialLink,
    downloadByLink,
  };
};

export default useFiles;
