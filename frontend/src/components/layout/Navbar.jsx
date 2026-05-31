import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthButtons from "./AuthButtons.jsx";
import LoadingIndicator from "../ui/LoadingIndicator.jsx";
import AdminNavItem from "./AdminNavItem.jsx";

export default function Navbar() {
  const { loading, isAuthenticated }  = useSelector(state => state.auth);

  if (loading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <span className="navbar-brand d-flex align-items-center">
            <strong>My Cloud</strong>
          </span>
          <LoadingIndicator size="sm" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <strong>My Cloud</strong>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link active">Главная</Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link to="/files" className="nav-link">Файлы</Link>
              </li>
            )}
            <AdminNavItem />
          </ul>

          <AuthButtons />
        </div>
      </div>
    </nav>
  )
}