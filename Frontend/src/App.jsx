import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import RegisterForm from "./pages/RegisterForm.jsx";
import LoginForm from "./pages/LoginForm.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        {/* Redirect unknown routes to register */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
