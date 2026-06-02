import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage.jsx";
import FilesPage from "../../pages/FilesPage.jsx";
import LoginPage from "../../pages/LoginPage.jsx";
import RegisterPage from "../../pages/RegisterPage.jsx";
import PublicRoute from "../auth/PublicRoute.jsx";
import ProtectedRoute from "../auth/ProtectedRoute.jsx";
import AdminRoute from "../admin/AdminRoute.jsx";
import AdminPage from "../../pages/AdminPage.jsx";
import FileDownloadPage from "../../pages/FileDownloadPage.jsx";
import UserFilesPage from "../../pages/UserFilesPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/s/:specialLink" element={<FileDownloadPage />} />
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
      <Route path="admin/" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      }>
        <Route path="users/:userId/files" element={<UserFilesPage />} />
      </Route>
    </Routes>
  )
}