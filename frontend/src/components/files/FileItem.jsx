import { useState } from 'react';
import Button from '../ui/Button';
import LoadingIndicator from '../ui/LoadingIndicator';
import { useFiles } from '../../hooks/useFiles';
import { formatFileSize, formatDate } from "../../utils/fileUtils.js";

export default function FileItem({ file }) {
  const { deleteFile, downloadFile, copySpecialLink } = useFiles();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
    }
  };

  const handleCopyLink = async () => {
    setIsCopyingLink(true);
    try {
      await copySpecialLink(file.id);
      console.log('Ссылка скопирована');
    } catch (error) {
      console.log('Ошибка копирования ссылки:', error);
    } finally {
      setIsCopyingLink(false);
    }
  }

  const handleDelete= async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFile(file.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <tr>
      <td>
        <div className="fw-medium">{file.original_name}</div>
      </td>
      <td>
        <div className="text-muted small">
          {file.comment || <em>Без комментария</em>}
        </div>
      </td>
      <td>{formatFileSize(file.size)}</td>
      <td>{formatDate(file.upload_at)}</td>
      <td>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleDownload}
            title="Скачать файл"
            extendClass="flex-shrink-0"
          >
            Скачать
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCopyLink}
            disabled={isCopyingLink}
            title="Скопировать специальную ссылку"
            extendClass="flex-shrink-0"
          >
            {isCopyingLink ? (
              <LoadingIndicator size="sm" text="" />
            ) : (
              'Ссылка'
            )}
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Удалить файл"
            extendClass="flex-shrink-0"
          >
            {isDeleting ? (
              <LoadingIndicator size="sm" text="" />
            ) : (
              'Удалить'
            )}
          </Button>
        </div>
      </td>
    </tr>
  )
}