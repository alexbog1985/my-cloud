import { useState } from 'react';
import { useUsers } from "../../hooks/useUsers";
import Button from '../../components/ui/Button';
import { formatFileSize } from "../../utils/fileUtils";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal.jsx";

export default function UserActions({ user }) {
  const { toggleAdmin, deleteUser } = useUsers();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleToggleAdmin = () => {
    setConfirmAction('toggle');
    setShowConfirm(true);
  };

  const handleDeleteUser = () => {
    setConfirmAction('delete');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (confirmAction ==='toggle') {
      await toggleAdmin(user.id);
    } else if (confirmAction === 'delete') {
      await deleteUser(user.id);
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  }

  const getConfirmMessage = () => {
    if (confirmAction === 'toggle') {
      return `Вы уверены, что хотите ${user.is_admin ? "снять" : "назначить"} права администратора для пользователя ${user.username}?`;
    }
    return `Вы уверены, что хотите удалить пользователя ${user.username}?`;
  };

  return (
    <>
      <div className="d-flex flex-column flex-sm-row gap-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleToggleAdmin}
          extendClass="w-100 w-sm-auto"
        >
          {user.is_admin ? 'Снять админа' : 'Назначить администратором'}
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={handleDeleteUser}
          extendClass="w-100 w-sm-auto"
        >
          Удалить
        </Button>
        <Link
          to={`/admin/users/${user.id}/files`}
          className="btn btn-sm btn-outline-info w-100 w-sm-auto"
        >
          Файлы ({user.file_count || 0}, {formatFileSize(user.storage_size || 0)})
        </Link>
      </div>

      <Modal
        show={showConfirm}
        title="Подтвердите действие"
        onClose={handleCancel}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
            >
              Да
            </button>
          </>
        }
      >
        <p>{getConfirmMessage()}</p>
      </Modal>
  </>
  )
}