// import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterUserPage from "./pages/user/RegisterUserPage";
import LoginUserPage from "./pages/user/LoginUserPage";
import RegisterAmbulancePage from "./pages/ambulance/RegisterAmbulancePage";
import LoginAmbulancePage from "./pages/ambulance/LoginAmbulancePage";
import UserDashboard from "./pages/user/UserDashboard";
import DriverDashboard from "./pages/ambulance/DriverDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalLoginPage from "./pages/hospital/HospitalLoginPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterUserPage />} />
        <Route path="/login" element={<LoginUserPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />


        <Route path="/ambulance/register" element={<RegisterAmbulancePage />} />
        <Route path="/ambulance/login" element={<LoginAmbulancePage />} />
        <Route path="/ambulance/dashboard" element={< DriverDashboard />} />



        <Route path="/admindashboard" element={< AdminDashboard />} />


        <Route path="/hospital/dashboard" element={< HospitalDashboard />} />
        <Route path="/hospital/login" element={< HospitalLoginPage />} />


      </Routes>
    </BrowserRouter>
  );
}
export default App;
