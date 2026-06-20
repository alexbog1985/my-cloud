import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

export default function LinkModal({ show, link, onClose }) {
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (show) {
      setCopySuccess(false);
    }
  }, [show]);

  const handleCopy = async () => {
    try {
      // Проверяем доступность clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      setCopySuccess(false);
    }
  };

  if (!show || !link) return null;

  return (
    <Modal
      show={show}
      title="Специальная ссылка"
      onClose={onClose}
      footer={
        <>
          {copySuccess ? (
            <div className="text-success mb-3">
              Ссылка скопирована!
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopy}
            >
              Скопировать
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Закрыть
          </button>
        </>
      }
    >
      <div className="mb-3">
        <p className="text-muted">Скопируйте ссылку, чтобы поделиться файлом:</p>
        <div className="p-3 bg-light rounded border">
          <code className="text-break">{link}</code>
        </div>
      </div>
    </Modal>
  );
}