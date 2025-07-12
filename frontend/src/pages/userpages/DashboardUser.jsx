// DashboardUser.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Ambulance } from 'lucide-react';

import AlertMessage from '../../components/common/AlertMessage';
import AmbulanceList from '../../components/user/AmbulanceList';
import { headingVariants, buttonVariants } from '../../constants/variants'

const socket = io("http://localhost:5000", { withCredentials: true });

const DashboardUser = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/users/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch {
        setError("Failed to fetch user");
      }
    };

    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation not supported by browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        () => {
          setLocationError("Location access denied or unavailable.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    fetchUser();
    getLocation();

    socket.on("connect", () => console.log("Socket connected", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const handleEmergencyRequest = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAmbulances([]);

    if (!location.lat || !location.lng || !user) {
      setError("Location and user info required. Try again.");
      setLoading(false);
      return;
    }

    socket.emit("emergency_request", {
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
      name: user.name,
      email: user.email,
      userId: user._id,
      medicalHistory: user.medicalHistory || "None",
      bloodGroup: user.bloodGroup,
      phone: user.phone,
    });

    setSuccess("Emergency request sent");
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch {
      setError("Logout failed. Try again.");
    }
  };

  return (
    <section className="min-h-screen pt-24 pb-12 bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={headingVariants}
          initial="initial"
          animate="animate"
          className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-12"
        >
          User Dashboard
        </motion.h2>
        <div className="bg-gray-900/80 p-6 sm:p-8 rounded-xl shadow-lg border border-purple-800/50 backdrop-blur-sm">
          {location.lat && location.lng && (
            <p className="text-sm text-gray-400 text-center mb-8">
              Your Location: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
            </p>
          )}
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={handleEmergencyRequest}
            disabled={loading || locationError}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 mx-auto ${
              loading || locationError
                ? "bg-gray-600/50 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-600/30"
            }`}
          >
            <Ambulance size={20} />
            Request Emergency
          </motion.button>
          <AlertMessage message={locationError} isSuccess={false} />
          <AlertMessage message={error} isSuccess={false} />
          <AlertMessage message={success} isSuccess={true} />
          <AmbulanceList ambulances={ambulances} />
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={handleLogout}
            className="mt-6 w-full bg-gray-800 text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-700 hover:shadow-purple-600/30 transition-all duration-300"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default DashboardUser;