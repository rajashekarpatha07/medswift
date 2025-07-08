// src/pages/ambulancepages/LoginAmbulance.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Phone } from "lucide-react";
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

// Animation variants for form
const formVariants = {
  initial: { opacity: 0, y: 50 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// Animation variants for inputs and button
const inputVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
  focus: { scale: 1.02, transition: { duration: 0.3 } },
};

// Animation for submit button
const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3, type: "spring" } },
  tap: { scale: 0.95 },
};

const LoginAmbulance = () => {
  const [formData, setFormData] = useState({
    driverPhone: "",
    password: "",
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          setLocationError("Unable to retrieve location. Please allow location access.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!location.lat || !location.lng) {
      setError("Location is required. Please allow location access and try again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/ambulance/login", // Replace with your actual API endpoint
        {
          ...formData,
          driverlocation: {
            type: "Point",
            coordinates: [location.lng, location.lat], // [lng, lat] as per schema
          },
        },
        { withCredentials: true }
      );
      setSuccess(response.data.message || "Logged in successfully!");
      setFormData({ driverPhone: "", password: "" });
      setLocation({ lat: null, lng: null }); // Reset location
      // Redirect to dashboard after 1.5s
      setTimeout(() => navigate("/dashboard"), 1500); // Adjust path as needed
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="login-ambulance"
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
          Ambulance Login
        </motion.h2>

        <motion.form
          variants={formVariants}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit}
          className="bg-gray-900/80 p-6 sm:p-8 rounded-xl shadow-lg border border-purple-800/50 backdrop-blur-sm"
        >
          <div className="space-y-6">
            {[
              {
                name: "driverPhone",
                label: "Driver Phone",
                icon: <Phone size={20} className="text-blue-400" />,
                type: "tel",
              },
              {
                name: "password",
                label: "Password",
                icon: <Lock size={20} className="text-blue-400" />,
                type: "password",
              },
            ].map((field, i) => (
              <motion.div
                key={field.name}
                variants={inputVariants}
                initial="initial"
                animate="animate"
                custom={i}
                whileFocus="focus"
                className="relative"
              >
                <label
                  htmlFor={field.name}
                  className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-300 mb-2"
                >
                  {field.icon}
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </motion.div>
            ))}
          </div>

          {locationError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-4 text-center"
            >
              {locationError}
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-4 text-center"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-sm mt-4 text-center"
            >
              {success}
            </motion.p>
          )}

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={loading || locationError}
            className={`mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-purple-600/30 transition-all duration-300 ${
              (loading || locationError) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            className="text-sm text-gray-400 mt-4 text-center"
          >
            Don't have an account?{" "}
            <a
              href="/register-ambulance"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Register here
            </a>
          </motion.p>
        </motion.form>
      </div>
    </section>
  );
};

export default LoginAmbulance;