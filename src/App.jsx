import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { useAuthContext } from "./hooks/useAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/auth/Login";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UsersManagement from "./pages/dashboard/UsersManagement";
import EventsManagement from "./pages/dashboard/EventsManagement";
import ReportsManagement from "./pages/dashboard/ReportsManagement";

const AppRoutes = () => {
  const { user } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="reports" element={<ReportsManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
