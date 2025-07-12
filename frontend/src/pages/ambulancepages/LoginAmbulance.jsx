import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/common/Forminput';
import SubmitButton from '../../components/common/SubmitButton';
import AlertMessage from '../../components/common/AlertMessage';
import LocationDisplay from '../../components/ambulance/LocationDisplay';

const headingVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const LoginAmbulance = () => {
  const [formData, setFormData] = useState({
    driverPhone: '',
    password: '',
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
          setLocationError('Unable to retrieve location. Please allow location access.', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!location.lat || !location.lng) {
      setError('Location is required. Please allow location access and try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/ambulance/login',
        {
          ...formData,
          driverlocation: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
          },
        },
        { withCredentials: true }
      );
      setSuccess(response.data.message || 'Logged in successfully!');
      setFormData({ driverPhone: '', password: '' });
      setLocation({ lat: null, lng: null });
      setTimeout(() => navigate('/ambulance/dashboard'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred during login.'
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
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/80 p-6 sm:p-8 rounded-xl shadow-lg border border-purple-800/50 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <FormInput
              id="driverPhone"
              name="driverPhone"
              type="tel"
              label="Driver Phone"
              value={formData.driverPhone}
              onChange={handleChange}
              required
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <LocationDisplay
              latitude={location.lat}
              longitude={location.lng}
              geoError={locationError}
            />
          </div>
          <AlertMessage message={error} isSuccess={false} />
          <AlertMessage message={success} isSuccess={true} />
          <SubmitButton
            isLoading={loading}
            label="Login"
            loadingLabel="Logging in..."
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            className="text-sm text-gray-400 mt-4 text-center"
          >
            Don't have an account?{' '}
            <a
              href="/ambulance/register"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Register here
            </a>
          </motion.p>
        </form>
      </div>
    </section>
  );
};

export default LoginAmbulance;