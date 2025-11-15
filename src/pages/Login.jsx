
// // export default Login
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
// import { useAuthStore } from "../store/authStore.js";




// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
 
 
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//  const loginUser = useAuthStore((state) => state.login);
// const loading = useAuthStore((state) => state.loading);
// const errorStore = useAuthStore((state) => state.error);


//   const validateEmail = (email) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   const response = await loginUser(email, password);

//   if (response.success) {
//     navigate("/");
//   }
// };


//   return (
//     <div
//       className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
//       style={{ backgroundImage: "url('/background_login.jpg')" }}
//     >
//       {/* Overlay with blur effect */}
//       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

//       {/* Login Card */}
//       <div className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/10 dark:bg-gray-900/50 backdrop-blur-md border border-white/20">
//         {/* Logo */}
//         <div className="flex justify-center mb-5">
//           <img
//             src="/Property ATM Logo.png"
//             alt="Property Atm Logo"
//             className="w-20 h-20 rounded-full border border-white shadow-lg"
//           />
//         </div>

//         {/* Title */}
//         <h2 className="text-center text-3xl font-bold text-white mb-2">
//           Property Atm
//         </h2>
//         <p className="text-center text-gray-300 text-sm mb-6">
//           Lead Generation CRM — Manage leads, performance & more
//         </p>

//         {/* Error */}
//         {errorStore && (
//   <div className="mb-4 p-3 text-center rounded-lg bg-red-500/20 border border-red-400 text-red-100 text-sm">
//     {errorStore}
//   </div>
// )}


//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm text-gray-300 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail
//                 size={18}
//                 className="absolute left-3 top-2.5 text-gray-400"
//               />
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="admin@propertyatm.com"
//                 className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-500/40 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none transition"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm text-gray-300 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <Lock
//                 size={18}
//                 className="absolute left-3 top-2.5 text-gray-400"
//               />
             
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-gray-500/40 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none transition"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
//                 aria-label="Toggle Password Visibility"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
//           >
//             <LogIn size={18} />
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <a
//             href="#"
//             className="text-sm text-orange-400 hover:underline transition"
//           >
//             Forgot Password?
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const loginUser = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const errorStore = useAuthStore((state) => state.error);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) return;

    const response = await loginUser(email, password);

    if (response.success) {
      navigate("/dashboard"); // OR "/"
    }
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
        {errorStore && (
          <div className="mb-4 p-3 text-center rounded-lg bg-red-500/20 border border-red-400 text-red-100 text-sm">
            {errorStore}
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 
            text-white font-semibold py-2.5 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? "Signing in..." : "Sign In"}
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
