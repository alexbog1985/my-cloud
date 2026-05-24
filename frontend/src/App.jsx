import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import AuthLoading from "./components/auth/AuthLoading.jsx";
import AppRoutes from "./components/layout/AppRoutes.jsx";


function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-2">
        <div className="container">
          <AuthLoading>
            <AppRoutes />
          </AuthLoading>
        </div>
      </main>

      <Footer />
      </div>
    </Router>
  )
}

export default App
