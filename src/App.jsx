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
const AllEmployees = lazy(() => import("./pages/employees/AllEmployees.jsx"));
const AddLead = lazy(() => import("./pages/leads/AddLead.jsx"));
const Reports = lazy(() => import("./pages/Reports.jsx"));
const EditLead = lazy(() => import("./pages/leads/EditLead.jsx"));
const AllLeads = lazy(() => import("./pages/leads/AllLeads.jsx"));
const MyLeads = lazy(() => import("./pages/leads/MyLeads.jsx"));
const MyVisits = lazy(() => import("./pages/Visits/MyVisits.jsx"));
const AllVisits = lazy(() => import("./pages/Visits/AllVisits.jsx"));
// const CustomerDetail = lazy(() => import("./pages/customers/CustomerDetail.jsx"));
const AllCustomers = lazy(() => import("./pages/customers/AllCustomers.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));

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
            <Route path="/add-lead" element={<AddLead />} />
            <Route path="/edit-lead/:id" element={<EditLead />} />
            <Route path="/all-leads" element={<AllLeads />} />
            <Route path="/my-leads" element={<MyLeads />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/add" element={<AddDetails />} />
            <Route path="/add-employee" element={<AddEmployee />} />
            <Route path="/all-employee" element={<AllEmployees />} />
            <Route path="/permissions" element={<AddPermissions />} />
            <Route path="/my-visits" element={<MyVisits />} />
            <Route path="/all-visits" element={<AllVisits />} />
            {/* <Route path="/customers/:id" element={<CustomerDetail />} /> */}
            <Route path="/all-customers" element={<AllCustomers />} />
            <Route path="/settings" element={<Settings />} />
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
