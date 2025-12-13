// src/layout/AdminLayout.jsx
import Sidebar from "../components/AdminSidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import { Outlet } from "react-router-dom";
import { useLogout } from "../hooks/useAuthQueries.js";

const AdminLayout = () => {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
        {/* Navbar - Fixed height */}
        <div className="flex-shrink-0">
          <Navbar onLogout={handleLogout} />
        </div>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
