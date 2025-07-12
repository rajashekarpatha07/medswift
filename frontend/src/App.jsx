import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Register from './pages/userpages/Register';
import Login from './pages/userpages/Login';
import DashboardUser from './pages/userpages/DashboardUser';
import RegisterAmbulance from './pages/ambulancepages/RegisterAmbulance';
import LoginAmbulance from './pages/ambulancepages/LoginAmbulance';
import DashboardAmbulance from './pages/ambulancepages/DashboardAmbulance';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardUser />} />
          <Route path="/ambulance/register" element={<RegisterAmbulance />} />
          <Route path="/ambulance/login" element={<LoginAmbulance />} />
          <Route path="/ambulance/dashboard" element={<DashboardAmbulance />} />
          <Route path="/" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;