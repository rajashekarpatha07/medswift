// import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterUserPage from "./pages/user/RegisterUserPage";
import LoginUserPage from "./pages/user/LoginUserPage";
import RegisterAmbulancePage from "./pages/ambulance/RegisterAmbulancePage";
import LoginAmbulancePage from "./pages/ambulance/LoginAmbulancePage";
import DashboardUser from "./pages/user/DashboardUser";
import DashboardAmbulance from "./pages/ambulance/DashboardAmbulance";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterUserPage />} />
        <Route path="/login" element={<LoginUserPage />} />
        <Route path="/dashboard" element={<DashboardUser />} />


        <Route path="/ambulance/register" element={<RegisterAmbulancePage />} />
        <Route path="/ambulance/login" element={<LoginAmbulancePage />} />
        <Route path="/ambulance/dashboard" element={<DashboardAmbulance />} />


      </Routes>
    </BrowserRouter>
  );
}
export default App;
