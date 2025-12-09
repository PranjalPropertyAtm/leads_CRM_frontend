import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLoadUser } from "../hooks/useAuthQueries.js";
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
  FiBarChart2,
} from "react-icons/fi";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useLoadUser();

  const [openMenus, setOpenMenus] = useState({
    leads: false,
    employee: false,
    masters: false,
    visits: false,
    customers: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => {
      // Close all other menus and toggle the clicked menu
      const newState = {
        leads: false,
        employee: false,
        masters: false,
        visits: false,
        customers: false,
      };
      // Toggle the clicked menu only if it's currently closed
      newState[menu] = !prev[menu];
      return newState;
    });
  };

  const closeAllMenus = () => {
    setOpenMenus({
      leads: false,
      employee: false,
      masters: false,
      visits: false,
      customers: false,
    });
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
          bg-slate-900 text-white h-screen flex flex-col fixed md:fixed top-0 left-0 z-50 
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64"}
        `}
      >
        {/* Logo Section */}
        <div className="relative w-16 h-16 overflow-hidden shadow-2xl transition-transform duration-300 active:scale-95 m-24 mt-4 mb-0">
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
        <nav className="mt-6 text-sm font-medium flex-1 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 transition-colors duration-200 hover:bg-slate-800 
               ${isActive ? "bg-slate-800 border-l-4 border-yellow-400" : ""}`
            }
            onClick={() => {
              setIsOpen(false);
              closeAllMenus();
            }}
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

          {/* Visits Dropdown */}
          <button
            onClick={() => toggleMenu("visits")}
            className="flex w-full items-center justify-between px-6 py-3 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-4">
              <FiFolder className="text-lg" /> Visits
            </span>
            {openMenus.visits ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {openMenus.visits && (
            <div className="ml-12 mt-1 space-y-1 text-gray-300">

              {/* Admin sees both All + My visits */}
              {user?.role !== "employee" && (
                <NavLink
                  to="/all-visits"
                  className="block px-3 py-2 rounded hover:bg-slate-800"
                  onClick={() => setIsOpen(false)}
                >
                  All Visits
                </NavLink>
              )}

              {/* All users see My Visits */}
              <NavLink
                to="/my-visits"
                className="block px-3 py-2 rounded hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                My Visits
              </NavLink>

            </div>
          )}

          {/* Customers Menu */}
          {user?.role !== "employee" && (
            <>
              <button
                onClick={() => toggleMenu("customers")}
                className="flex w-full items-center justify-between px-6 py-3 hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-4">
                  <FiUsers className="text-lg" /> Customers
                </span>
                {openMenus.customers ? <FiChevronDown /> : <FiChevronRight />}
              </button>

              {openMenus.customers && (
                <div className="ml-12 mt-1 space-y-1 text-gray-300">
                  <NavLink
                    to="/all-customers"
                    className="block px-3 py-2 rounded hover:bg-slate-800"
                    onClick={() => setIsOpen(false)}
                  >
                    All Customers
                  </NavLink>
                </div>
              )}
            </>
          )}

          {/* Reports */}
          <NavLink
            to="/reports"
            className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800 transition-colors "
            onClick={() => setIsOpen(false)}
          >
            <FiBarChart2 className="text-lg" />
            <span>Reports</span>
          </NavLink>



          {/* Employee Dropdown */}
          {user?.role !== "employee" && (
            <>
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
            </>
          )}

          {/* Masters Dropdown - Only visible for admins */}
          {user?.role !== "employee" && (
            <>
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
            </>
          )}

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-3 transition-colors duration-200 hover:bg-slate-800 
               ${isActive ? "bg-slate-800 border-l-4 border-yellow-400" : ""}`
            }
            onClick={() => {
              setIsOpen(false);
              closeAllMenus();
            }}
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
