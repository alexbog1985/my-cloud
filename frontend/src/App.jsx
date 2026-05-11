import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-2">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="register/" element={<RegisterPage/>} />
          </Routes>
        </div>
      </main>

      <Footer />
      </div>
    </Router>
  )
}

export default App
