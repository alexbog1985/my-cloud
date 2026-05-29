import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useApi } from "./useApi";

import {
  setLoading,
  setFiles,
  setErrors,
  addFile,
  updateFile,
  removeFile,
  setUploading,
  setUploadProgress,
  setUploadComplete,
  resetUpload
} from "../store/slices/filesSlice.js";

export const useFiles = () => {
  const dispatch = useDispatch();
  const { request } = useApi();

  const fetchFiles = useCallback(async () => {
    dispatch(setLoading());
    try {
      const response = await request({
        url: '/files/',
        method: 'GET',
      });
      dispatch(setFiles(response.data));
    } catch (error) {
      dispatch(setErrors(error.response?.data || { general: 'Ошибка загрузки файлов' }));
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
        url: '/files/',
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
      return response.data;
    } catch (error) {
      console.error('Ошибка загрузки фала:', error);
      dispatch(setErrors(error.response?.data || { general: 'Ошибка загрузки файла' }));
      dispatch(resetUpload());
      throw error;
    }
  }, [dispatch, request]);

  const updateFileData = useCallback(async (fileId, data) => {
    try {
      const response = await request({
        url: `/files/${fileId}/`,
        method: 'PATСH',
        data: data,
      });
      dispatch(updateFile(response.data));
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления файла:', error);
      dispatch(setErrors(error.response?.data || { general: 'Ошибка обновления файла'}));
      throw error;
    }
  }, [dispatch, request]);

  const deleteFile = useCallback(async (fileId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    try {
      await request({
        url: `/files/${fileId}/`,
        method: 'DELETE',
      });
      dispatch(removeFile(fileId));
      dispatch(setErrors({}));
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      dispatch(setErrors({ delete: error.response?.data ||  'Ошибка удаления файла' }));
    }
  }, [dispatch, request]);

  const downloadFile = useCallback(async (fileId) => {

    const fileResponse = await request({
      url: `/files/${fileId}/`,
      method: 'GET',
    })

    const fileName = fileResponse.data.original_name || 'file';

    try {
      const response = await request({
        url: `/files/${fileId}/download/`,
        method: 'GET',
        responseType: 'blob',
      })
      console.log(response.headers)

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания файла', error);
      dispatch(setErrors({ download: error.response?.data || 'Ошибка скачивания файла' }));
      throw error;
    }
  }, [dispatch, request]);

  const copySpecialLink = useCallback(async (fileId) => {
    try {
      const response = await request({
        url: `/files/${fileId}/`,
        method: 'GET',
      });

      if (response.data.special_link) {
        const link = `$window.location.origin/s/${response.data.special_link}/`;
        await navigator.clipboard.writeText(link);
        return link;
      }
    } catch (error) {
      console.error("Ошибка получения ссылки:", error);
      dispatch(setErrors({ copy: error.response?.data || 'Ошибка получения ссылки' }));
    }
  }, [dispatch, request]);

  return {
    fetchFiles,
    uploadFile,
    updateFile: updateFileData,
    deleteFile,
    downloadFile,
    copySpecialLink,
  };
};

export default useFiles;
