// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss()
//   ],

//    resolve: {
//     dedupe: ["react", "react-dom"], // 👈 VERY IMPORTANT
//   },

//   alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },

//   optimizeDeps: {
//     include: ["zustand"],
//   },
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },

  optimizeDeps: {
    include: ["zustand"],
  },
});
