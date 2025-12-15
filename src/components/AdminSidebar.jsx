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
          bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen flex flex-col fixed md:fixed top-0 left-0 z-50 
          transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-64"}
        `}
      >
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg shadow-lg bg-white/10 backdrop-blur-sm">
              <img
                src="/Property ATM Logo.png"
                alt="Property ATM Logo"
                className="object-cover w-full h-full p-1"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Property ATM
              </h2>
              <p className="text-xs text-slate-400 font-medium">CRM System</p>
            </div>
          </div>
        </div>

        {/* MENU LIST */}
        <nav className="mt-2 px-3 py-4 text-sm font-medium flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 font-medium
               ${isActive 
                 ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30" 
                 : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`
            }
            onClick={() => {
              setIsOpen(false);
              closeAllMenus();
            }}
          >
            <FiHome className="text-lg" />
            <span>Dashboard</span>
          </NavLink>

          {/* Leads Dropdown */}
          <button
            onClick={() => toggleMenu("leads")}
            className="flex w-full items-center justify-between px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 font-medium"
          >
            <span className="flex items-center gap-3">
              <FiList className="text-lg" /> 
              <span>Leads</span>
            </span>
            {openMenus.leads ? <FiChevronDown className="text-sm" /> : <FiChevronRight className="text-sm" />}
          </button>

          {openMenus.leads && (
            <div className="ml-4 mt-1 mb-2 space-y-1 border-l-2 border-slate-700/50 pl-4">
              <NavLink
                to="/add-lead"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-all duration-200
                   ${isActive 
                     ? "bg-slate-800/70 text-white font-medium" 
                     : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                }
                onClick={() => setIsOpen(false)}
              >
                Add Lead
              </NavLink>
              <NavLink
                to="/all-leads"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-all duration-200
                   ${isActive 
                     ? "bg-slate-800/70 text-white font-medium" 
                     : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                }
                onClick={() => setIsOpen(false)}
              >
                All Leads
              </NavLink>
              <NavLink
                to="/my-leads"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-all duration-200
                   ${isActive 
                     ? "bg-slate-800/70 text-white font-medium" 
                     : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                }
                onClick={() => setIsOpen(false)}
              >
                My Leads
              </NavLink>
            </div>
          )}

          {/* Visits Dropdown */}
          <button
            onClick={() => toggleMenu("visits")}
            className="flex w-full items-center justify-between px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 font-medium"
          >
            <span className="flex items-center gap-3">
              <FiFolder className="text-lg" /> 
              <span>Visits</span>
            </span>
            {openMenus.visits ? <FiChevronDown className="text-sm" /> : <FiChevronRight className="text-sm" />}
          </button>

          {openMenus.visits && (
            <div className="ml-4 mt-1 mb-2 space-y-1 border-l-2 border-slate-700/50 pl-4">
              {/* Admin sees both All + My visits */}
              {user?.role !== "employee" && (
                <NavLink
                  to="/all-visits"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-all duration-200
                     ${isActive 
                       ? "bg-slate-800/70 text-white font-medium" 
                       : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  All Visits
                </NavLink>
              )}

              {/* All users see My Visits */}
              <NavLink
                to="/my-visits"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-all duration-200
                   ${isActive 
                     ? "bg-slate-800/70 text-white font-medium" 
                     : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                }
                onClick={() => setIsOpen(false)}
              >
                My Visits
              </NavLink>
            </div>
          )}

          {/* Customers Menu */}
          {/* {user?.role !== "employee" && ( */}
            <>
              <button
                onClick={() => toggleMenu("customers")}
                className="flex w-full items-center justify-between px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 font-medium"
              >
                <span className="flex items-center gap-3">
                  <FiUsers className="text-lg" /> 
                  <span>Customers</span>
                </span>
                {openMenus.customers ? <FiChevronDown className="text-sm" /> : <FiChevronRight className="text-sm" />}
              </button>

              {openMenus.customers && (
                <div className="ml-4 mt-1 mb-2 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <NavLink
                    to="/all-customers"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-all duration-200
                       ${isActive 
                         ? "bg-slate-800/70 text-white font-medium" 
                         : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    All Customers
                  </NavLink>
                </div>
              )}
            </>
          {/* )} */}

          {/* Reports */}
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 font-medium
               ${isActive 
                 ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30" 
                 : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`
            }
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
                className="flex w-full items-center justify-between px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 font-medium"
              >
                <span className="flex items-center gap-3">
                  <FiUsers className="text-lg" /> 
                  <span>Employees</span>
                </span>
                {openMenus.employee ? <FiChevronDown className="text-sm" /> : <FiChevronRight className="text-sm" />}
              </button>

              {openMenus.employee && (
                <div className="ml-4 mt-1 mb-2 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <NavLink
                    to="/add-employee"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-all duration-200
                       ${isActive 
                         ? "bg-slate-800/70 text-white font-medium" 
                         : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    Add Employee
                  </NavLink>
                  <NavLink
                    to="/all-employee"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-all duration-200
                       ${isActive 
                         ? "bg-slate-800/70 text-white font-medium" 
                         : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    All Employees
                  </NavLink>
                  {/* <NavLink
                    to="/permissions"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-all duration-200
                       ${isActive 
                         ? "bg-slate-800/70 text-white font-medium" 
                         : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    Add Permissions
                  </NavLink> */}
                </div>
              )}
            </>
          )}

          {/* Masters Dropdown - Only visible for admins */}
          {user?.role !== "employee" && (
            <>
              <button
                onClick={() => toggleMenu("masters")}
                className="flex w-full items-center justify-between px-4 py-3 mb-1 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 font-medium"
              >
                <span className="flex items-center gap-3">
                  <FiFolder className="text-lg" /> 
                  <span>Masters</span>
                </span>
                {openMenus.masters ? <FiChevronDown className="text-sm" /> : <FiChevronRight className="text-sm" />}
              </button>

              {openMenus.masters && (
                <div className="ml-4 mt-1 mb-2 space-y-1 border-l-2 border-slate-700/50 pl-4">
                  <NavLink
                    to="/add"
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-all duration-200
                       ${isActive 
                         ? "bg-slate-800/70 text-white font-medium" 
                         : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"}`
                    }
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
              `flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 font-medium
               ${isActive 
                 ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30" 
                 : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`
            }
            onClick={() => {
              setIsOpen(false);
              closeAllMenus();
            }}
          >
            <FiSettings className="text-lg" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;
