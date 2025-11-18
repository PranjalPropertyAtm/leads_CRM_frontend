import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiList,
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiX,
  FiFolder,
} from "react-icons/fi";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [openMenus, setOpenMenus] = useState({
    leads: false,
    employee: false,
    masters: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <>
      {/* 📱 Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-2">
          <img
            src="/Property ATM Logo.png"
            alt="Property ATM Logo"
            className="w-8 h-8 object-cover"
          />
          <h1 className="text-lg font-semibold tracking-wide">
            Property ATM 
          </h1>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="p-1">
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* 🧭 Sidebar */}
      <div
        className={`
          bg-slate-900 text-white min-h-screen fixed md:static top-0 left-0 z-50 
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64"}
        `}
      >
        {/* Logo Section */}
        <div className="relative w-[64px] h-[64px] overflow-hidden shadow-2xl transition-transform duration-300 active:scale-95 m-24 mt-4 mb-0">
          <img
            src="/Property ATM Logo.png"
            alt="Property ATM Logo"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="p-5 flex items-center justify-center border-b border-slate-700">
          <h2 className="text-xl font-bold tracking-wide text-gray-100">
            Property ATM 
          </h2>
        </div>

        {/* MENU LIST */}
        <nav className="mt-6 text-sm font-medium">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 transition-colors duration-200 hover:bg-slate-800 
               ${isActive ? "bg-slate-800 border-l-4 border-yellow-400" : ""}`
            }
            onClick={() => setIsOpen(false)}
          >
            <FiHome className="text-lg" />
            Dashboard
          </NavLink>

          {/* Leads Dropdown */}
          <button
            onClick={() => toggleMenu("leads")}
            className="flex w-full items-center justify-between px-6 py-3 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-4">
              <FiList className="text-lg" /> Leads
            </span>
            {openMenus.leads ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openMenus.leads && (
            <div className="ml-12 mt-1 space-y-1 text-gray-300">
              <NavLink
                to="/add-lead"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Add Lead
              </NavLink>
              <NavLink
                to="/all-leads"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                All Leads
              </NavLink>
              <NavLink
                to="/my-leads"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                My Leads
              </NavLink>
            </div>
          )}

          {/* Employee Dropdown */}
          <button
            onClick={() => toggleMenu("employee")}
            className="flex w-full items-center justify-between px-6 py-3 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-4">
              <FiUsers className="text-lg" /> Employees
            </span>
            {openMenus.employee ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openMenus.employee && (
            <div className="ml-12 mt-1 space-y-1 text-gray-300">
              <NavLink
                to="/add-employee"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Add Employee
              </NavLink>
              <NavLink
                to="/all-employee"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                All Employees
              </NavLink>
              <NavLink
                to="/permissions"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Add Permissions
              </NavLink>
            </div>
          )}

          {/* Masters Dropdown */}
          <button
            onClick={() => toggleMenu("masters")}
            className="flex w-full items-center justify-between px-6 py-3 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-4">
              <FiFolder className="text-lg" /> Masters
            </span>
            {openMenus.masters ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openMenus.masters && (
            <div className="ml-12 mt-1 space-y-1 text-gray-300">
              <NavLink
                to="/add"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Add Property Details
              </NavLink>
            </div>
          )}

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 transition-colors duration-200 hover:bg-slate-800 
               ${isActive ? "bg-slate-800 border-l-4 border-yellow-400" : ""}`
            }
            onClick={() => setIsOpen(false)}
          >
            <FiSettings className="text-lg" />
            Settings
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
