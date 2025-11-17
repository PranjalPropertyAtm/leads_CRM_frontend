import React, { useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiSearch,
  FiLogOut,
} from "react-icons/fi";

const Navbar = ({ onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-2">
          {/* <img
            src="/logo.png"
            alt="Logo"
            className="w-9 h-9 rounded-md object-cover shadow-sm"
          /> */}
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 tracking-wide">
            Property ATM
          </h1>
        </div>

        {/* CENTER: Search (Desktop only) */}
        <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-full w-1/3">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search here..."
            className="bg-transparent outline-none w-full text-sm text-gray-700"
          />
        </div>

        {/* RIGHT: Notification + Profile */}
        <div className="flex items-center gap-4 relative">

          {/* Bell Icon */}
          <FiBell className="text-gray-700 text-xl cursor-pointer hover:text-black transition" />

          {/* Profile + Menu (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2"
            >
              <img
                src="https://api.dicebear.com/8.x/avataaars/svg?seed=admin"
                alt="Admin"
                className="w-9 h-9 rounded-full border border-gray-300"
              />
              <span className="text-gray-700 font-medium">Admin</span>
              <FiChevronDown className="text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 bg-white shadow-xl rounded-xl w-48 border border-gray-100 p-2">
                <ul className="text-gray-700 text-sm font-medium">
                  <li
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-red-500"
                  >
                    <FiLogOut /> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE: Search + Compact Admin */}
      <div className="px-4 pb-3 md:hidden flex items-center justify-between gap-3">

        {/* Search */}
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full flex-1">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-sm text-gray-700"
          />
        </div>

        {/* Avatar + Logout */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 shrink-0">
          <img
            src="https://api.dicebear.com/8.x/avataaars/svg?seed=admin"
            alt="Admin"
            className="w-7 h-7 rounded-full border border-gray-300"
          />
          <button
            onClick={onLogout}
            className="text-red-500 text-sm flex items-center gap-1 hover:text-red-600 transition"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
