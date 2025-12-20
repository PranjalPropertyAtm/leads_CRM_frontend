import React, { useState, useRef, useEffect } from "react";
import {
  FiBell,
  FiChevronDown,
  FiSearch,
  FiLogOut,
} from "react-icons/fi";
import { useLoadUser } from "../hooks/useAuthQueries.js";

const Navbar = ({ onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { data: user } = useLoadUser();

  const menuRef = useRef(null);

  // Close profile menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showMenu]);


  return (
    <nav className="bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">PA</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              Property ATM
            </h1>
            <p className="text-xs text-gray-500 font-medium hidden md:block">CRM Dashboard</p>
          </div>
        </div>

        {/* CENTER: Search (Desktop only) */}
        {/* <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-full w-1/3">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search here..."
            className="bg-transparent outline-none w-full text-sm text-gray-700"
          />
        </div> */}

        {/* RIGHT: Notification + Profile */}
        <div className="flex items-center gap-4 relative">

          {/* Bell Icon */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
            <FiBell className="text-gray-600 text-xl group-hover:text-gray-900 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile + Menu (Desktop) */}
          <div className="relative hidden md:block" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="relative">
                <img
                  src="https://api.dicebear.com/8.x/avataaars/svg?seed=admin"
                  alt="Admin"
                  className="w-9 h-9 rounded-full border-2 border-gray-200 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-gray-900 font-semibold text-sm">
                  {user?.name || (user?.role === "employee" ? "Employee" : "Admin")}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {user?.role === "employee" ? "Employee" : "Administrator"}
                </span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl w-56 border border-gray-200/80 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "No email"}</p>
                </div>
                <ul className="py-1">
                  <li
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 cursor-pointer transition-colors font-medium text-sm"
                  >
                    <FiLogOut className="text-base" /> 
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE: Search + Compact Admin */}
      <div className="px-4 pb-3 md:hidden flex items-center justify-between gap-3 border-t border-gray-100 pt-3">

        {/* Search */}
        <div className="flex items-center bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg flex-1 shadow-sm">
          <FiSearch className="text-gray-400 mr-2" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-sm text-gray-700 font-medium placeholder:text-gray-400"
          />
        </div>

        {/* Avatar + Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 shrink-0 hover:bg-red-100 transition-colors"
        >
          <img
            src="https://api.dicebear.com/8.x/avataaars/svg?seed=admin"
            alt="Admin"
            className="w-7 h-7 rounded-full border-2 border-red-200"
          />
          <FiLogOut className="text-red-600" size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
