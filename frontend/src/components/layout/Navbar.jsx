import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <strong>My Cloud</strong>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-togle="collapse"
          data-bs-target="#navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link active">Главная</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Регистрация</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link">Войти</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}