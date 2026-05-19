import { useSelector } from 'react-redux';
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";

export default function AuthLoading({ children }) {
  const { fetchUser } = useAuth();
  const loading = useSelector(state => state.auth.loading);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      const token = localStorage.getItem("token");
      if (token) {
        fetchUser().then();
      }
    }
  }, [isAuthenticated, loading, fetchUser]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="">Загрузка...</span>
        </div>
      </div>
    );
  }

  return children;
}
