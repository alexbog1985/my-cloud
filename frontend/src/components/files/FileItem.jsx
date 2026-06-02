import Button from '../ui/Button';
import { useFiles } from '../../hooks/useFiles';
import { formatFileSize, formatDate } from "../../utils/fileUtils.js";

export default function FileItem({ file, onDelete, onCopyLink, onRename }) {
  const { downloadFile } = useFiles();

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
    }
  };

  return (
    <tr>
      <td className="text-truncate" style={{ maxWidth: '200px' }}>
        <div className="fw-medium">{file.original_name}</div>
      </td>
      <td className="text-truncate" style={{ maxWidth: '150px' }}>
        <div className="text-muted small">
          {file.comment || <em>Без комментария</em>}
        </div>
      </td>
      <td>{formatFileSize(file.size)}</td>
      <td>{formatDate(file.upload_at)}</td>
      <td>
        {file.last_download_at && (
          <div className="text-muted small">
            {formatDate(file.last_download_at)}
          </div>
        )}
      </td>
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
            onClick={() => onCopyLink(file.id)}
            title="Скопировать специальную ссылку"
            extendClass="flex-shrink-0"
          >
            Ссылка
          </Button>

          <Button
            variant="outline-info"
            size="sm"
            onClick={() => onRename(file)}
            title="Редактировать файл"
            extendClass="flex-shrink-0"
          >
            Редактировать
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(file)}
            title="Удалить файл"
            extendClass="flex-shrink-0"
          >
            Удалить
          </Button>
        </div>
      </td>
    </tr>
  )
}