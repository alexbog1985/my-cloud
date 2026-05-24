import { useUsers } from "../../hooks/useUsers";
import Button from '../../components/ui/Button';

export default function UserActions({ user }) {
  const { toggleAdmin, deleteUser } = useUsers();

  const handleToggleAdmin = () => {
    if (window.confirm(`Вы уверены, что хотите ${user.is_admin ? "снять" : "назначить"} права администратора для пользователя ${user.username}?`)) {
      toggleAdmin(user.id).then();
    }
  };

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
    </div>
  )
}