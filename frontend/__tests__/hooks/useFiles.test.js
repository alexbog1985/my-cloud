const { renderHook, waitFor } = require('@testing-library/react');

// Импорты после моков
const { useFiles } = require('../../src/hooks/useFiles');
const {
  setFiles,
  setLoading,
  clearLoading,
  setUploading,
  addFile,
  setUploadComplete,
  removeFile,
  updateFile,
  setUploadProgress,
  resetUpload,
} = require('../../src/store/slices/filesSlice');

// Моки для зависимостей
jest.mock('../../src/store/slices/filesSlice');
jest.mock('../../src/hooks/useApi');
jest.mock('../../src/hooks/useNotifications');
jest.mock('../../src/hooks/useApiErrorHandler');
jest.mock('react-redux');

const dispatchMock = jest.fn();
const requestMock = jest.fn();
const errorMock = jest.fn();
const successMock = jest.fn();

describe('useFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Настройка моков по умолчанию
    require('react-redux').useDispatch.mockReturnValue(dispatchMock);
    require('../../src/hooks/useApi').useApi.mockReturnValue({ request: requestMock });
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: errorMock,
      success: successMock,
    });

    // Mock useApiErrorHandler - контекст добавляется внутри useCallback
    require('../../src/hooks/useApiErrorHandler').useApiErrorHandler.mockReturnValue((err) => {
      const message = err?.response?.data?.detail || err?.message || 'Неизвестная ошибка';
      errorMock(message);
      return message;
    });
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('хук должен быть определен', () => {
    expect(useFiles).toBeDefined();
  });

  test('должен возвращать ожидаемые методы', () => {
    const { result } = renderHook(() => useFiles());
    const methods = result.current;

    expect(methods).toHaveProperty('fetchFiles');
    expect(methods).toHaveProperty('uploadFile');
    expect(methods).toHaveProperty('updateFile');
    expect(methods).toHaveProperty('deleteFile');
    expect(methods).toHaveProperty('downloadFile');
    expect(methods).toHaveProperty('copySpecialLink');
    expect(methods).toHaveProperty('downloadByLink');

    // Проверить, что все методы - функции
    expect(typeof methods.fetchFiles).toBe('function');
    expect(typeof methods.uploadFile).toBe('function');
    expect(typeof methods.updateFile).toBe('function');
    expect(typeof methods.deleteFile).toBe('function');
    expect(typeof methods.downloadFile).toBe('function');
    expect(typeof methods.copySpecialLink).toBe('function');
    expect(typeof methods.downloadByLink).toBe('function');
  });

  describe('fetchFiles', () => {
    test('должен устанавливать loading и получать файлы', async () => {
      // Given
      const mockFiles = [{ id: 1, name: 'test.txt' }];
      const userId = 'user123';
      requestMock.mockResolvedValue({ data: mockFiles });

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.fetchFiles(userId);

      // Then
      await waitFor(() => {
        expect(dispatchMock).toHaveBeenCalledWith(setLoading());
        expect(dispatchMock).toHaveBeenCalledWith(setFiles(mockFiles));
      });
      expect(requestMock).toHaveBeenCalledWith({
        url: `/files/?user=${userId}`,
        method: 'GET'
      });
    });

    test('должен обрабатывать ошибки получения файлов', async () => {
      // Given
      const mockError = { response: { data: { detail: 'Ошибка загрузки' } } };
      requestMock.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.fetchFiles('user123');

      // Then
      expect(dispatchMock).toHaveBeenCalledWith(setLoading());
      expect(dispatchMock).toHaveBeenCalledWith(clearLoading());
    });
  });

  describe('uploadFile', () => {
    test('должен загружать файл и обновлять состояние', async () => {
      // Given
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockUploadResponse = {
        data: { id: 1, name: 'test.txt', original_name: 'test.txt' },
      };
      requestMock.mockResolvedValue(mockUploadResponse);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.uploadFile(mockFile);

      // Then
      await waitFor(() => {
        expect(dispatchMock).toHaveBeenCalledWith(setUploading());
        expect(dispatchMock).toHaveBeenCalledWith(addFile(mockUploadResponse.data));
        expect(dispatchMock).toHaveBeenCalledWith(setUploadComplete());
      });
      expect(successMock).toHaveBeenCalledWith('Файл "test.txt" успешно загружен');

      // Проверить, что был вызван request с FormData
      expect(requestMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/files/',
          method: 'POST',
          data: expect.any(FormData),
        })
      );
    });
  });

  describe('deleteFile', () => {
    test('должен удалять файл', async () => {
      // Given
      const fileId = 123;
      requestMock.mockResolvedValue({});

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.deleteFile(fileId);

      // Then
      expect(dispatchMock).toHaveBeenCalledWith(removeFile(fileId));
      expect(requestMock).toHaveBeenCalledWith({
        url: `/files/${fileId}/`,
        method: 'DELETE',
      });
    });

    test('должен обрабатывать ошибки удаления файла', async () => {
      // Given
      const fileId = 123;
      const mockError = { response: { data: { detail: 'Нельзя удалить файл' } } };
      requestMock.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.deleteFile(fileId);

      // Then
      expect(errorMock).toHaveBeenCalledWith('Нельзя удалить файл');
    });
  });

  describe('updateFile', () => {
    test('должен обновлять данные файла', async () => {
      // Given
      const fileId = 123;
      const updateData = { comment: 'Updated comment' };
      const mockResponse = {
        data: { id: 1, name: 'updated.txt', comment: 'Updated comment' },
      };
      requestMock.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.updateFile(fileId, updateData);

      // Then
      expect(dispatchMock).toHaveBeenCalledWith(updateFile(mockResponse.data));
      expect(requestMock).toHaveBeenCalledWith({
        url: `/files/${fileId}/`,
        method: 'PATCH',
        data: updateData,
      });
    });
  });

  describe('copySpecialLink', () => {
    beforeEach(() => {
      // Мок navigator.clipboard
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
    });

    afterEach(() => {
      delete global.navigator.clipboard;
    });

    test('должен копировать ссылку в буфер обмена', async () => {
      // Given
      const fileId = 123;
      const specialLink = 'abc123';
      const mockResponse = {
        data: { id: 1, name: 'test.txt', special_link: specialLink },
      };
      requestMock.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFiles());

      // When
      const link = await result.current.copySpecialLink(fileId);

      // Then
      expect(link).toBe(`${window.location.origin}/s/${specialLink}/`);
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(link);
    });

    test('должен возвращать undefined если нет special_link', async () => {
      // Given
      const fileId = 123;
      const mockResponse = {
        data: { id: 1, name: 'test.txt', special_link: null },
      };
      requestMock.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFiles());

      // When
      const link = await result.current.copySpecialLink(fileId);

      // Then
      expect(link).toBeUndefined();
    });

    test('должен обрабатывать ошибки получения ссылки', async () => {
      // Given
      const fileId = 123;
      const mockError = { response: { data: { detail: 'Файл не найден' } } };
      requestMock.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.copySpecialLink(fileId);

      // Then
      expect(errorMock).toHaveBeenCalledWith('Файл не найден');
    });
  });

  describe('downloadByLink', () => {
    test('должен скачивать файл по специальной ссылке', async () => {
      // Given
      const specialLink = 'abc123';
      const mockResponse = {
        data: { original_name: 'test.txt' },
      };
      requestMock.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.downloadByLink(specialLink);

      // Then
      expect(requestMock).toHaveBeenCalledWith({
        url: `/s/${specialLink}/`,
        method: 'GET',
        params: { info: true },
      });
    });

    test('должен обрабатывать ошибки скачивания по ссылке', async () => {
      // Given
      const specialLink = 'abc123';
      const mockError = { response: { data: { detail: 'Файл не найден' } } };
      requestMock.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFiles());

      // When
      await result.current.downloadByLink(specialLink);

      // Then
      expect(errorMock).toHaveBeenCalledWith('Ошибка скачивания по ссылке: Файл не найден');
    });
  });
});
