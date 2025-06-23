import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, Loader2 } from 'lucide-react';
import './UserLogin.css';

const UserLogin = () => {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors({});
    setMessage('');
  };

  const handleSubmit = async () => {
    const { phone, password } = formData;
    const newErrors = {};

    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard'; // Or wherever you redirect
        }, 2000);
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header">
          <h1 className="title">Welcome Back</h1>
          <p className="subtitle">Log in to access MedSwift services</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

        <div className="form-container">
          {/* Phone Field */}
          <div className="form-group">
            <label className="form-label">
              <Phone className="icon" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">
              <Lock className="icon" />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input password-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
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

          {/* Submit */}
          <button
            className="submit-button"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="icon animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </div>

        <div className="footer">
          <p className="footer-text">
            Don’t have an account?{' '}
            <a href="/register" className="footer-link">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
