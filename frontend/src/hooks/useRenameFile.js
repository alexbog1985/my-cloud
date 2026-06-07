import {useCallback} from 'react';
import {useFiles} from './useFiles';
import { useNotifications } from "./useNotifications";

export const useRenameFile = () => {
  const { updateFile } = useFiles();
  const { error } = useNotifications();

  const renameFile = useCallback( async (fileId, data) => {
    try {
      return await updateFile(fileId, data);
    } catch (err) {
      error(err.response?.data?.detail || 'Ошибка переименования файла');
      throw err;
    }
  }, [updateFile]);

  return { renameFile };
}

export default useRenameFile;