import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AuthLoading from "./components/auth/AuthLoading";
import AppRoutes from "./components/layout/AppRoutes";
import NotificationContainer from "./components/ui/NotificationContainer";
import { useNotifications } from "./hooks/useNotifications.jsx";

function App() {
  const { notifications, removeNotification } = useNotifications();

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
        <NotificationContainer
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    </Router>
  )
}

export default App
