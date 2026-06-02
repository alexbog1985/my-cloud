import { useUsers } from "../../hooks/useUsers";
import Button from '../../components/ui/Button';
import {formatFileSize} from "../../utils/fileUtils.js";
import {Link} from "react-router-dom";

export default function UserActions({ user }) {
  const { toggleAdmin, deleteUser } = useUsers();

  // TODO Нужно убрать window.confirm
  const handleToggleAdmin = () => {
    if (window.confirm(`Вы уверены, что хотите ${user.is_admin ? "снять" : "назначить"} права администратора для пользователя ${user.username}?`)) {
      toggleAdmin(user.id).then();
    }
  };

  // TODO Нужно убрать window.confirm
  const handleDeleteUser = () => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${user.username}?`)) {
      deleteUser(user.id).then();
    }
  };

  return (
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
  )
}