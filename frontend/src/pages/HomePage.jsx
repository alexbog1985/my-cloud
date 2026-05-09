import { Link } from 'react-router-dom'
import Navbar from "../components/layout/Navbar.jsx";

export default function HomePage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <header className="bg-primary text-white text-center py-5" style={{ borderRadius: '0 0 20px 20px' }}>
        <h1>My Cloud</h1>
        <p>Облачное хранилище</p>
      </header>

      <main className="flex-grow-1 py-5">
        <div className="container">
          <section className="text-center mb-5">
          <h2 className="mb-4">Возможности</h2>
          <ul className="list-unstyled d-inline-block text-start" style={{ maxWidth: '400px'}}>
            <li className="mb-3">Загружайте и скачивайте файлы</li>
            <li className="mb-3">Делитесь ссылками с друзьями</li>
          </ul>
          </section>

          <section className="d-flex justify-content-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg px-4">Зарегистрироваться</Link>
          <Link to="/register" className="btn btn-outline-primary btn-lg px-4">Войти</Link>
          </section>
        </div>
      </main>

      <footer className="bg-light py-3 text-center text-muted">
        &copy; 2026 My Cloud.
      </footer>
    </div>
  )
}