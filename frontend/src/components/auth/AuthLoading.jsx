import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

export default function AuthLoading({ children }) {
  const { fetchUser } = useAuth();
  const loading = useSelector(state => state.auth.loading);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      const token = localStorage.getItem("token");
      if (token) {
        fetchUser().finally(() => setAuthChecked(true));
      } else {
        setAuthChecked(true);
      }
    }
  }, [isAuthenticated, loading, authChecked, fetchUser]);

  if (!authChecked || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return children;
}
