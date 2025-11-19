// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load page components
const Login = lazy(() => import("./pages/Login.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const AdminLayout = lazy(() => import("./components/AdminLayout.jsx"));
const AddDetails = lazy(() => import("./pages/master/AddDetails.jsx"));
const AddEmployee = lazy(() => import("./pages/employees/AddEmployee.jsx"));
const AddPermissions = lazy(() => import("./pages/employees/AddPermissions.jsx"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
     <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Layout */}
          <Route
            element={
               <ProtectedRoute><AdminLayout/></ProtectedRoute> 
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<AddDetails />} />
            <Route path="/add-employee" element={<AddEmployee />} />
            <Route path="/permissions" element={<AddPermissions />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{
          fontSize: "14px",
          fontWeight: 500,
        }}
      />
      </>
  );
}

export default App;
