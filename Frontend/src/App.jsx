import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import RegisterForm from "./pages/user/RegisterForm.jsx";
import LoginForm from "./pages/user/LoginForm.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";

import AmbulanceRegister from "./pages/ambulance/AmbulanceRegister.jsx";
import AmbulanceLogin from "./pages/ambulance/AmbulanceLogin.jsx";
// import AmbulanceDashboard from "./pages/ambulance/AmbulanceDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Ambulance Routes */}
        <Route path="/ambulance/register" element={<AmbulanceRegister />} />
        <Route path="/ambulance/login" element={<AmbulanceLogin />} />
        {/* <Route path="/ambulance/dashboard" element={<AmbulanceDashboard />} /> */}

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
