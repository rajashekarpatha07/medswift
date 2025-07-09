// src/pages/userpages/DashboardUser.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ambulance } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Animation variants for heading
const headingVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Animation variants for button and list
const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, type: "spring" },
  },
  hover: { scale: 1.05, transition: { duration: 0.3, type: "spring" } },
  tap: { scale: 0.95 },
};

const listVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

const DashboardUser = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const navigate = useNavigate();

  // Fetch geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      console.log("Requesting geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation received:", position.coords);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          console.error("Geolocation error:", err.message);
          setLocationError("Unable to retrieve location. Please allow location access.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation not supported by browser");
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleEmergencyRequest = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAmbulances([]);

    if (!location.lat || !location.lng) {
      console.error("Location unavailable for emergency request");
      setError("Location is required. Please allow location access and try again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending emergency request with location:", {
        location: { type: "Point", coordinates: [location.lng, location.lat] },
      });
      const response = await axios.post(
        //http://localhost:5000/api/v1/Ambulance/emergencyRequest
        "http://localhost:5000/api/v1/users/emergencyRequest",
        {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
        },
        { withCredentials: true }
      );
      console.log("Emergency request response:", response.data);
      setAmbulances(response.data.data || []);
      setSuccess(response.data.message || "Emergency request sent successfully!");
    } catch (err) {
      console.error("Emergency request error:", err.response?.data || err.message || err);
      if (err.response?.status === 401) {
        console.log("JWT expired or invalid, redirecting to /ambulance/login");
        navigate("/login");
      } else {
        console.log(err)
        setError(
          err.response?.data?.message || "An error occurred while sending emergency request."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Initiating logout...");
      await axios.post(
        "http://localhost:5000/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
      console.log("Logout successful");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
      setError("Failed to logout. Please try again.");
    }
  };

  return (
    <section
      id="dashboard-user"
      className="min-h-screen pt-24 pb-12 bg-gray-950 text-white relative overflow-hidden"
    >
      {/* Subtle Background Gradient */}
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
          <div className="text-center mb-8">
            {location.lat && location.lng && (
              <p className="text-sm text-gray-400">
                Your Location: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
              </p>
            )}
          </div>

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

          {locationError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-6 text-center"
            >
              {locationError}
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-6 text-center"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-sm mt-6 text-center"
            >
              {success}
            </motion.p>
          )}

          {ambulances.length > 0 && (
            <motion.div
              variants={listVariants}
              initial="initial"
              animate="animate"
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Nearby Ambulances ({ambulances.length})
              </h3>
              <ul className="space-y-4">
                {ambulances.map((ambulance) => (
                  <motion.li
                    key={ambulance._id}
                    variants={listItemVariants}
                    className="bg-gray-800/50 p-4 rounded-lg"
                  >
                    <p className="text-gray-200">
                      <span className="font-medium">Driver:</span> {ambulance.drivername}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <span className="font-medium">Vehicle:</span> {ambulance.vehicleNumber}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <span className="font-medium">Location:</span> Lat{" "}
                      {ambulance.driverlocation.coordinates[1].toFixed(4)}, Lng{" "}
                      {ambulance.driverlocation.coordinates[0].toFixed(4)}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

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