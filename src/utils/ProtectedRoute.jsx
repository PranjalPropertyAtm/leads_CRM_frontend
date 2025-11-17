// src/components/ProtectedRoute.jsx
import { Navigate} from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children,allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // ⛔ If not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ If allowedRoles diya hai aur user usme nahi aata
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Auth Success → Load child routes
  return children;
};

export default ProtectedRoute;
