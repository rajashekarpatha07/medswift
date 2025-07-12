import React, { useState } from 'react';
import FormInput from '../../components/common/Forminput';
import SubmitButton from '../../components/common/SubmitButton';
import AlertMessage from '../../components/common/AlertMessage';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message);
        setFormData({ phone: '', password: '' });
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.log(error);
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
          MedSwift Login
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              id="phone"
              name="phone"
              type="tel"
              label="Phone"
              value={formData.phone}
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
            />
          </div>
          <AlertMessage message={message} isSuccess={isSuccess} />
          <SubmitButton
            isLoading={isLoading}
            label="Login"
            loadingLabel="Logging in..."
          />
        </form>
      </div>
    </div>
  );
};

export default Login;