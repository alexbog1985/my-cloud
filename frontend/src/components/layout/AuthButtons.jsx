import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice.js'

export default function AuthButtons() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isAuthenticated && user) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
             style={{ width: '32px', height: '32px', fontSize: '0.875rem', fontWeight: '500' }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="d-none d-md-block text-dark fw-semibold text-nowrap">
          {user.full_name || user.username}
        </span>
        <Link
          to="/login"
          onClick={handleLogout}
          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
        >
          Выйти
        </Link>
      </div>
    )
  }

  return (
    <div className="d-flex gap-2">
      <Link
        to="/register"
        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1"
      >
        Регистрация
      </Link>
      <Link
        to="/login"
        className="btn btn-primary btn-sm text-white rounded-pill px-3 py-1"
      >
        Войти
      </Link>
    </div>
  )
}