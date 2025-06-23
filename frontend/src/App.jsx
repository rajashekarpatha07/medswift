import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserRegistration from "./pages/UserRegistration";
import UserLogin from "./pages/UserLogin";
import DriverRegister from "./pages/DriverRegister";

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/driver/register" element={<DriverRegister />} />

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </Router>
  );
}

export default App;
