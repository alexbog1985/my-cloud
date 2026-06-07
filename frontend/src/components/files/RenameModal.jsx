import {useEffect, useState} from "react";
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';

export default function RenameModal({ show, file, onRename, onClose }) {
  const [newName, setNewName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && file) {
      setNewName(file.original_name);
      setNewComment(file.comment || '');
      setError('');
    }
  }, [show, file]);

  const handleRename = async () => {
    if (!newName.trim()) {
      setError('Имя файла не может быть пустым');
      return;
    }

    try {
      await onRename(file.id, { original_name: newName, comment: newComment });
      onClose();
    } catch (error) {
      setError('Ошибка обновления файла');
    }
  };

  if (!show || !file) return null;

  return (
    <Modal
      show={show}
      title="Редактировать файл"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRename}
          >
            Сохранить
          </button>
        </>
      }
    >
      <div className="mb-3">
        <FormInput
          label="Имя файла"
          name="original_name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError("");
          }}
          error={error}
        />
        <FormInput
          label="Комментарий"
          name="comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
      </div>
    </Modal>
  )
}