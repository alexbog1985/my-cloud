import { useSelector } from 'react-redux';
import { useUsers } from '../../hooks/useUsers.js'
import UserActions from './UserActions';
import { useFetchOnMount } from "../../hooks/useFetchOnMount.js";
import {formatFileSize} from "../../utils/fileUtils.js";

const columns = [
  { key: 'user', label: 'Пользователь', render: (user) => (
    <>
      <div className="fw-medium">{user.username}</div>
      <div className="text-muted small">{user.full_name}</div>

    </>
  )},
  { key: 'email', label: 'Email', render: (user) => user.email },
  { key: 'date_joined', label: 'Дата регистрации', render: (user) => {
    const date = new Date(user.date_joined);
    return (
      <div>
        <div>{date.toLocaleDateString()}</div>
        <div className="text-muted small">{date.toLocaleTimeString()}</div>
      </div>
    );
  } },
  { key: 'is_admin', label: 'Администратор', render: (user) => (
    <span className={`badge ${user.is_admin ? 'bg-success' : 'bg-secondary'}`}>
      {user.is_admin ? 'Да' : 'Нет'}
    </span>
  )},
  { key: 'storage', label: 'Хранилище', render: (user) => (
      <div className="text-muted small">
        <div>Файлов: {user.file_count || 0}</div>
        <div>Размер: {formatFileSize(user.storage_size || 0)}</div>
      </div>
    )},
  { key: 'actions', label: 'Действия', render: (user) => <UserActions user={user} /> }
];

export default function UsersTable() {
  const { users, loading } = useSelector((state) => state.users);
  const { fetchUsers } = useUsers();

  useFetchOnMount(fetchUsers);

  if (loading) {
    return <div>Загрузка...</div>
  }
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(user)}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}