import {useCallback} from 'react';
import {useFiles} from './useFiles';

export const useRenameFile = () => {
  const { updateFile } = useFiles();

  const renameFile = useCallback( async (fileId, data) => {
    try {
      return await updateFile(fileId, data);
    } catch (error) {
      console.error('Ошибка переименования файла:', error);
      throw error;
    }
  }, [updateFile]);

  return { renameFile };
}

export default useRenameFile;