import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/userpages/Register';
import Login from './pages/userpages/Login';
import RegisterAmbulance from './pages/ambulancepages/RegisterAmbulance';
import LoginAmbulance from './pages/ambulancepages/LoginAmbulance';
import DashboardAmbulance from './pages/ambulancepages/DashboardAmbulance';
import DashboardUser from './pages/userpages/DashboardUser';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation Bar */}
        <nav className="bg-indigo-600 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white text-2xl font-bold">MedSwift</div>
            <div className="space-x-4">
              <Link
                to="/register"
                className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardUser />} />
          <Route path="/" element={<Register />} /> {/* Default route */}
          <Route path="/ambulance/register"element={<RegisterAmbulance/>}/>
          <Route path="/ambulance/login"element={<LoginAmbulance/>}/>
          <Route path="/ambulance/dashboard"element={<DashboardAmbulance/>}/>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;