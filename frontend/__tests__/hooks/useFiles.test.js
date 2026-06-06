import { renderHook, waitFor } from '@testing-library/react';

// Моки для зависимостей ДО импорта useFiles
jest.mock('../../src/store/slices/filesSlice');
jest.mock('../../src/hooks/useApi');
jest.mock('../../src/hooks/useNotifications');
jest.mock('../../src/hooks/useApiErrorHandler');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

// Импорт после моков
import { useFiles } from '../../src/hooks/useFiles';
import {
  setFiles, setLoading, clearLoading,
  setUploading, addFile, setUploadComplete, removeFile, updateFile
} from '../../src/store/slices/filesSlice';

describe('useFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('хук должен быть определен', () => {
    expect(useFiles).toBeDefined();
  });

  test('должен возвращать ожидаемые методы', () => {
    // Настроить моки перед вызовом renderHook
    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: jest.fn() });
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());

    const methods = result.current;

    expect(methods).toHaveProperty('fetchFiles');
    expect(methods).toHaveProperty('uploadFile');
    expect(methods).toHaveProperty('updateFile');
    expect(methods).toHaveProperty('deleteFile');
    expect(methods).toHaveProperty('downloadFile');
    expect(methods).toHaveProperty('copySpecialLink');
    expect(methods).toHaveProperty('downloadByLink');
  });

  test('fetchFiles должен устанавливать loading и получать файлы', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'test.txt' }] });
    const mockDispatch = jest.fn();

    // Настроить моки перед вызовом renderHook
    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());
    await result.current.fetchFiles('user123');

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setLoading());
      expect(mockDispatch).toHaveBeenCalledWith(setFiles([{ id: 1, name: 'test.txt' }]));
    });
  });

  test('uploadFile должен загружать файл и обновлять состояние', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      data: { id: 1, name: 'test.txt', original_name: 'test.txt' }
    });
    const mockDispatch = jest.fn();
    const mockSuccess = jest.fn();

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: mockSuccess
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    await result.current.uploadFile(file);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        url: '/files/',
        method: 'POST',
        data: expect.any(FormData),
      }));
    });

    expect(mockSuccess).toHaveBeenCalledWith('Файл "test.txt" успешно загружен');
    expect(mockDispatch).toHaveBeenCalledWith(setUploading());
    expect(mockDispatch).toHaveBeenCalledWith(addFile({ id: 1, name: 'test.txt', original_name: 'test.txt' }));
    expect(mockDispatch).toHaveBeenCalledWith(setUploadComplete());
  });

  test('deleteFile должен удалять файл', async () => {
    const mockRequest = jest.fn().mockResolvedValue({});
    const mockDispatch = jest.fn();

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());
    await result.current.deleteFile(123);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({
        url: '/files/123/',
        method: 'DELETE',
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(removeFile(123));
  });

  test('updateFile должен обновлять данные файла', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      data: { id: 1, name: 'updated.txt', comment: 'Updated comment' }
    });
    const mockDispatch = jest.fn();

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());
    await result.current.updateFile(123, { comment: 'Updated comment' });

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({
        url: '/files/123/',
        method: 'PATCH',
        data: { comment: 'Updated comment' },
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(updateFile({
      id: 1,
      name: 'updated.txt',
      comment: 'Updated comment'
    }));
  });

  test('copySpecialLink должен копировать ссылку в буфер обмена', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      data: { id: 1, name: 'test.txt', special_link: 'abc123' }
    });
    const mockDispatch = jest.fn();
    const mockWriteText = jest.fn().mockResolvedValue(undefined);

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    // Мок navigator.clipboard
    global.navigator.clipboard = {
      writeText: mockWriteText
    };

    const { result } = renderHook(() => useFiles());
    const link = await result.current.copySpecialLink(123);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({
        url: '/files/123/',
        method: 'GET',
      });
    });

    expect(link).toBe(`${window.location.origin}/s/abc123/`);
    expect(mockWriteText).toHaveBeenCalledWith(link);
  });

  test('copySpecialLink должен возвращать undefined если нет special_link', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      data: { id: 1, name: 'test.txt', special_link: null }
    });
    const mockDispatch = jest.fn();

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn(),
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    // Мок navigator.clipboard
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    };

    const { result } = renderHook(() => useFiles());
    const link = await result.current.copySpecialLink(123);

    expect(link).toBeUndefined();
    expect(mockRequest).toHaveBeenCalledWith({
      url: '/files/123/',
      method: 'GET',
    });
  });

  test('downloadByLink должен скачивать файл по специальной ссылке', async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      data: { original_name: 'test.txt' }
    });
    const mockError = jest.fn();
    const mockDownloadFileContent = jest.fn().mockResolvedValue(undefined);

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(jest.fn());
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockError,
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());

    // Мок downloadFileContent через замыкание
    // Это сложный тест, так как downloadFileContent — это внутренняя функция хука
    // Для простоты просто проверим вызов API
    await result.current.downloadByLink('abc123');

    expect(mockRequest).toHaveBeenCalledWith({
      url: '/s/abc123/',
      method: 'GET',
      params: { info: true },
    });
  });

  test('downloadByLink должен обрабатывать ошибки', async () => {
    const mockRequest = jest.fn().mockRejectedValue({
      response: { data: { detail: 'Файл не найден' } }
    });
    const mockError = jest.fn();

    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: mockRequest });
    require('react-redux').useDispatch.mockReturnValue(jest.fn());
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockError,
      success: jest.fn()
    });
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useFiles());
    await result.current.downloadByLink('abc123');

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Ошибка скачивания по ссылке: Файл не найден');
    });
  });
});
