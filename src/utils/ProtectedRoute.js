// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Not logged in → login pe bhej do
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check → allowedRoles me hona chahiye
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
