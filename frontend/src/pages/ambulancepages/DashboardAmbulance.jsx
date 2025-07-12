import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage';
import StatusDisplay from '../../components/ambulance/StatusDisplay';
import StatusButtons from '../../components/ambulance/StatusButtons';

const headingVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring' } },
  hover: { scale: 1.05, transition: { duration: 0.3, type: 'spring' } },
  tap: { scale: 0.95 },
};

const DashboardAmbulance = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('offline');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAmbulanceData = async () => {
      try {
        console.log('Fetching ambulance data...');
        const response = await axios.get('http://localhost:5000/api/v1/ambulance/me', {
          withCredentials: true,
        });
        console.log('Ambulance data fetched:', response.data);
        setCurrentStatus(response.data.data.status || 'offline');
      } catch (err) {
        console.error('Error fetching ambulance data:', err.response?.data || err.message);
        setError('Failed to load ambulance data. Please try logging in again.');
        navigate('/ambulance/login');
      }
    };

    if (navigator.geolocation) {
      console.log('Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation received:', position.coords);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          console.error('Geolocation error:', err.message);
          setLocationError('Unable to retrieve location. Please allow location access.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation not supported by browser');
      setLocationError('Geolocation is not supported by your browser.');
    }

    fetchAmbulanceData();
  }, [navigate]);

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!location.lat || !location.lng) {
      console.error('Location unavailable for status update:', status);
      setError('Location is required. Please allow location access and try again.');
      setLoading(false);
      return;
    }

    try {
      console.log(`Updating status to ${status} with location:`, location);
      const response = await axios.patch(
        'http://localhost:5000/api/v1/ambulance/status',
        {
          status,
          driverlocation: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
          },
        },
        { withCredentials: true }
      );
      console.log('Status update response:', response.data);
      setSuccess(response.data.message || `Status updated to ${status}`);
      setCurrentStatus(status);
    } catch (err) {
      console.error('Status update error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message || 'An error occurred while updating status.'
      );
      if (err.response?.status === 401) {
        navigate('/ambulance/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Initiating logout...');
      await axios.post(
        'http://localhost:5000/api/v1/ambulance/logout',
        {},
        { withCredentials: true }
      );
      console.log('Logout successful');
      navigate('/ambulance/login');
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
      setError('Failed to logout. Please try again.');
    }
  };

  return (
    <section
      id="dashboard-ambulance"
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
          Ambulance Dashboard
        </motion.h2>
        <div className="bg-gray-900/80 p-6 sm:p-8 rounded-xl shadow-lg border border-purple-800/50 backdrop-blur-sm">
          <StatusDisplay
            status={currentStatus}
            latitude={location.lat}
            longitude={location.lng}
          />
          <StatusButtons
            currentStatus={currentStatus}
            onStatusUpdate={handleStatusUpdate}
            isLoading={loading}
            hasLocationError={locationError}
          />
          <AlertMessage message={locationError} isSuccess={false} />
          <AlertMessage message={error} isSuccess={false} />
          <AlertMessage message={success} isSuccess={true} />
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

export default DashboardAmbulance;