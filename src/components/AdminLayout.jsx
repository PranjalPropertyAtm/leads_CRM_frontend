// src/layout/AdminLayout.jsx
import Sidebar from "../components/AdminSidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

const AdminLayout = () => {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar onLogout={logout} />

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
