import { useEffect } from "react";
import { useSelector } from 'react-redux';
import { useUsers } from '../../hooks/useUsers.js'
import UserActions from './UserActions';

const columns = [
  { key: 'user', label: 'Пользователь', render: (user) => (
    <>
      <strong>{user.username}</strong><br />
      <small>{user.full_name}</small>

    </>
  )},
  { key: 'email', label: 'Email', render: (user) => user.email },
  { key: 'date_joned', label: 'Дата регистрации', render: (user) => new Date(user.date_joined).toLocaleDateString() },
  { key: 'is_admin', label: 'Администратор', render: (user) => user.is_admin ? 'Да' : 'Нет'},
  { key: 'actions', label: 'Действия', render: (user) => <UserActions user={user} /> }
];

export default function UsersTable() {
  const { users, loading } = useSelector((state) => state.users);
  const { fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers().then();
  }, [fetchUsers]);

  if (loading) {
    return <div>Загрузка...</div>
  }
  return (
    <div className="table-responsive">
      <table className="table table-striped">
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