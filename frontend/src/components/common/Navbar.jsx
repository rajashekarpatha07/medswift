import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">MedSwift</div>
        <div className="space-x-4">
          <Link
            to="/register"
            className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            User Register
          </Link>
          <Link
            to="/login"
            className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            User Login
          </Link>
          <Link
            to="/ambulance/register"
            className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Ambulance Register
          </Link>
          <Link
            to="/ambulance/login"
            className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Ambulance Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;