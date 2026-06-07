import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function AdminNavItem() {
  const { user } = useSelector(state => state.auth);

  if (!user || !user.is_admin) return null;

  return (
      <li className="nav-item">
        <Link to="/admin" className="nav-link">Админка</Link>
      </li>
  )
}
