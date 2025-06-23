import React, { useState } from 'react';
import { MapPin, Eye, EyeOff, Phone, Mail, User, Loader2, Ambulance } from 'lucide-react';
import './DriverRegister.css';

const DriverRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleNumber: '',
    hospitalName: '',
    driverStatus: 'available',
    driverLocation: { coordinates: [0, 0] }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors({});
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          driverLocation: {
            coordinates: [pos.coords.longitude, pos.coords.latitude]
          }
        }));
        setLocationLoading(false);
      },
      () => {
        setErrors({ location: "Unable to fetch location" });
        setLocationLoading(false);
      }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.includes('@')) newErrors.email = "Valid email required";
    if (!formData.password || formData.password.length < 6) newErrors.password = "Min 6 character password";
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = "10-digit phone required";
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = "Vehicle number required";
    if (!formData.hospitalName.trim()) newErrors.hospitalName = "Hospital name required";
    if (formData.driverLocation.coordinates[0] === 0 && formData.driverLocation.coordinates[1] === 0)
      newErrors.location = "Location required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/ambulanceDrivers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Driver registered! Redirecting...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setErrors({ submit: data.message || 'Something went wrong' });
      }
    } catch {
      setErrors({ submit: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-container">
      <div className="driver-card">
        <div className="header">
          <h1 className="title">Register as Driver</h1>
          <p className="subtitle">Join MedSwift Ambulance Network</p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

        <div className="form-container">
          {/* Name */}
          <div className="form-group">
            <label className="form-label"><User className="icon" /> Full Name</label>
            <input name="name" className={`form-input ${errors.name ? 'error' : ''}`} value={formData.name} onChange={handleInputChange} />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label"><Mail className="icon" /> Email</label>
            <input name="email" className={`form-input ${errors.email ? 'error' : ''}`} value={formData.email} onChange={handleInputChange} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-input password-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="icon-small" /> : <Eye className="icon-small" />}
              </button>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label"><Phone className="icon" /> Phone</label>
            <input name="phone" className={`form-input ${errors.phone ? 'error' : ''}`} value={formData.phone} onChange={handleInputChange} />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          {/* Vehicle Number */}
          <div className="form-group">
            <label className="form-label"><Ambulance className="icon" /> Vehicle Number</label>
            <input name="vehicleNumber" className={`form-input ${errors.vehicleNumber ? 'error' : ''}`} value={formData.vehicleNumber} onChange={handleInputChange} />
            {errors.vehicleNumber && <p className="error-message">{errors.vehicleNumber}</p>}
          </div>

          {/* Hospital */}
          <div className="form-group">
            <label className="form-label">Hospital Name</label>
            <input name="hospitalName" className={`form-input ${errors.hospitalName ? 'error' : ''}`} value={formData.hospitalName} onChange={handleInputChange} />
            {errors.hospitalName && <p className="error-message">{errors.hospitalName}</p>}
          </div>

          {/* Location Button */}
          <div className="form-group">
            <label className="form-label"><MapPin className="icon" /> Location</label>
            <button type="button" className="location-button" onClick={getCurrentLocation} disabled={locationLoading}>
              {locationLoading ? <Loader2 className="icon animate-spin" /> : <MapPin className="icon" />}
              {locationLoading ? 'Capturing...' : 'Get Current Location'}
            </button>
            {errors.location && <p className="error-message">{errors.location}</p>}
          </div>

          {/* Submit */}
          <button className="submit-button" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader2 className="icon animate-spin" /> Submitting...</> : 'Register as Driver'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;
