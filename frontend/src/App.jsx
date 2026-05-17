import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import FilesPage from "./pages/FilesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PublicRoute from "./components/auth/PublicRoute.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import {useDispatch} from "react-redux";
import {useAuth} from "./hooks/useAuth.js";
import {useEffect} from "react";
import {setUser} from "./store/slices/authSlice.js";


function App() {
  const dispatch = useDispatch();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser().then(user => {
        if (user) {
          dispatch(setUser(user));
        }
      });
    }
  }, [dispatch, fetchUser]);


  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-2">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="register/" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
              } />
            <Route path="login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="files/" element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </main>

      <Footer />
      </div>
    </Router>
  )
}

export default App
