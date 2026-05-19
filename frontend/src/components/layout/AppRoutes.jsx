import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage.jsx";
import FilesPage from "../../pages/FilesPage.jsx";
import LoginPage from "../../pages/LoginPage.jsx";
import RegisterPage from "../../pages/RegisterPage.jsx";
import PublicRoute from "../auth/PublicRoute.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="register/" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="login/" element={
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
  )
}