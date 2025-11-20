

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useLogin, useLoadUser } from "../hooks/useAuthQueries.js";
import { notify } from "../utils/toast.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loginMutation = useLogin();
  const loadUserQuery = useLoadUser();

  useEffect(() => {
    // Check if user is already logged in
    if (loadUserQuery.data) {
      navigate("/dashboard");
    }
  }, [loadUserQuery.data, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          notify.success("Login successful");
          navigate("/dashboard");
        },
        onError: (error) => {
          const errorMsg = error.response?.data?.message || "Login failed";
          setError(errorMsg);
          notify.error(errorMsg);
        },
      }
    );
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/background_login.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/10 dark:bg-gray-900/50 backdrop-blur-md border border-white/20">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img
            src="/Property ATM Logo.png"
            alt="Property ATM Logo"
            className="w-20 h-20 rounded-full border border-white shadow-lg"
          />
        </div>

        <h2 className="text-center text-3xl font-bold text-white mb-2">
          Property Atm
        </h2>
        <p className="text-center text-gray-300 text-sm mb-6">
          Lead Generation CRM — Manage leads, performance & more
        </p>

        {/* Error Box */}
        {error && (
          <div className="mb-4 p-3 text-center rounded-lg bg-red-500/20 border border-red-400 text-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@propertyatm.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-500/40 
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Password
            </label>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-500/40 
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none transition"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-red-600 
            text-white font-semibold py-2.5 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            <LogIn size={18} />
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a className="text-sm text-orange-400 hover:underline transition" href="#">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
