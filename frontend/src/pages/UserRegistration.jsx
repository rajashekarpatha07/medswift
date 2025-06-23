import React, { useState } from 'react';
import { MapPin, Eye, EyeOff, Phone, Mail, User, Heart, FileText, Loader2 } from 'lucide-react';
import './UserRegistration.css';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: { coordinates: [0, 0] },
    bloodGroup: '',
    medicalHistory: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }));
          setLocationLoading(false);
          if (errors.location) {
            setErrors(prev => ({ ...prev, location: '' }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setErrors(prev => ({ ...prev, location: 'Unable to get location. Please try again.' }));
          setLocationLoading(false);
        }
      );
    } else {
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by this browser.' }));
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="header">
          <h1 className="title">Join MedSwift</h1>
          <p className="subtitle">Register to access emergency medical services</p>
        </div>

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            {errors.submit}
          </div>
        )}

        <div className="form-container">
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">
              <User className="icon" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">
              <Mail className="icon" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">
              Password *
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input password-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff className="icon-small" /> : <Eye className="icon-small" />}
              </button>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label className="form-label">
              <Phone className="icon" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter 10-digit phone number"
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          {/* Location Field */}
          <div className="form-group">
            <label className="form-label">
              <MapPin className="icon" />
              Location *
            </label>
            <div className="location-button-container">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="location-button"
              >
                {locationLoading ? (
                  <Loader2 className="icon animate-spin" />
                ) : (
                  <MapPin className="icon" />
                )}
                {locationLoading ? 'Getting Location...' : 'Get Current Location'}
              </button>
            </div>
            {formData.location.coordinates[0] !== 0 && (
              <p className="success-message">
                Location captured: {formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)}
              </p>
            )}
            {errors.location && <p className="error-message">{errors.location}</p>}
          </div>

          {/* Blood Group Field */}
          <div className="form-group">
            <label className="form-label">
              <Heart className="icon" />
              Blood Group (Optional)
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select blood group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Medical History Field */}
          <div className="form-group">
            <label className="form-label">
              <FileText className="icon" />
              Medical History (Optional)
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleInputChange}
              rows={3}
              className="form-textarea"
              placeholder="Any relevant medical history or conditions"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="icon animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <div className="footer">
          <p className="footer-text">
            Already have an account?{' '}
            <a href="/login" className="footer-link">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;