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
      fetchUser().catch(() => {
        // Если запрос не удался, все равно сбрасываем состояние загрузки
        setIsCheckingAuth(false);
      }).finally(() => {
        setIsCheckingAuth(false);
      });
    } else {
      // Если нет токена или уже авторизован - сбрасываем состояние
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
