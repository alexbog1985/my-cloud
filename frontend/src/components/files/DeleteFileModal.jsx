import Modal from '../ui/Modal';

export default function DeleteFileModal({ show, file, onConfirm, onCancel }) {
  if (!show || !file) return null;

  return (
      <Modal
        show={show}
        title="Удалить файл"
        onClose={onCancel}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              Удалить
            </button>
          </>
        }
      >
        <p>
          Вы уверены, что хотите удалить файл "
          <strong>{file.original_name}</strong>"?
        </p>
      </Modal>
  )
}
