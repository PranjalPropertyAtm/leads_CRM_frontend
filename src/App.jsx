// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AddDetails from "./pages/master/AddDetails.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
     <BrowserRouter>
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
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
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
