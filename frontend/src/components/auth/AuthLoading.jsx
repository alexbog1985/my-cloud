import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import LoadingIndicator from "../ui/LoadingIndicator";

export default function AuthLoading({ children }) {
  const { fetchUser } = useAuth();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !isAuthenticated) {
      fetchUser().finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, fetchUser]);

  if (isCheckingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <LoadingIndicator size="lg" text="Загрузка..." />
      </div>
    );
  }

  return children;
}
