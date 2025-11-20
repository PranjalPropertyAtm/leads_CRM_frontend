// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useLoadUser } from "../hooks/useAuthQueries.js";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { data: user, isLoading } = useLoadUser();
  const token = localStorage.getItem("token");

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
