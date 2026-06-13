import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFiles } from "../hooks/useFiles";
import { useNotifications } from "../hooks/useNotifications";

export default function FileDownloadPage() {
  const { specialLink } = useParams();
  const { downloadByLink } = useFiles();
  const { error } = useNotifications();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const downloadAndClose = async () => {
      setStatus('loading');
      try {
        await downloadByLink(specialLink);
        setStatus('success');
      } catch {
        setStatus('error');
        error('Ошибка скачивания файла');
      }
    };

    downloadAndClose().then();
  }, [specialLink, downloadByLink, error]);

  if (status === 'loading') {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Скачивание файла...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center py-5">
        {status === 'success' ? (
          <>
            <div className="alert alert-success" role="alert">
              Файл успешно скачан
            </div>
            <p className="mt-3">Теперь вы можете закрыть это окно</p>
          </>
        ) : (
          <>
            <div className="alert alert-danger" role="alert">
              Ошибка при скачивании файла
            </div>
            <p className="mt-3">Попробуйте снова или закройте это окно</p>
          </>
        )}
      </div>
    </div>
  )
}
