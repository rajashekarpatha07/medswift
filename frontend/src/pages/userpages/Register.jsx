import React, { useState, useEffect } from 'react';
import FormInput from '../../components/common/Forminput';
import FormSelect from '../../components/common/FormSelect';
import FormTextarea from '../../components/common/FormTextarea';
import SubmitButton from '../../components/common/SubmitButton';
import AlertMessage from '../../components/common/AlertMessage';
import LocationDisplay from '../../components/user/LocationDisplay';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    latitude: '',
    longitude: '',
    bloodGroup: '',
    medicalHistory: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          setGeoError('');
        },
        (error) => {
          setGeoError('Unable to fetch location. Please allow location access.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setGeoError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!formData.latitude || !formData.longitude) {
      setIsLoading(false);
      setIsSuccess(false);
      setMessage('Location coordinates are required. Please allow location access.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(formData.longitude),
              parseFloat(formData.latitude)
            ]
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          latitude: formData.latitude,
          longitude: formData.longitude,
          bloodGroup: '',
          medicalHistory: ''
        });
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
      MedSwift Registration
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              id="name"
              name="name"
              type="text"
              label="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
            <FormInput
              id="phone"
              name="phone"
              type="tel"
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <LocationDisplay
              latitude={formData.latitude}
              longitude={formData.longitude}
              geoError={geoError}
            />
            <FormSelect
              id="bloodGroup"
              name="bloodGroup"
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              options={bloodGroups}
              placeholder="Select Blood Group"
            />
            <FormTextarea
              id="medicalHistory"
              name="medicalHistory"
              label="Medical History (Optional)"
              value={formData.medicalHistory}
              onChange={handleInputChange}
            />
          </div>
          <AlertMessage message={message} isSuccess={isSuccess} />
          <SubmitButton
            isLoading={isLoading}
            label="Register"
            loadingLabel="Registering..."
          />
        </form>
      </div>
    </div>
  );
};

export default Register;