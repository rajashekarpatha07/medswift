import React, { useState } from 'react';
import { Mail, Lock, User, Phone, HeartPulse } from 'lucide-react';

// --- Reusable Input Component ---
// You can move this to a separate components folder later, e.g., src/components/Input.jsx
const Input = ({ icon, ...props }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Dynamically create the icon component */}
                {React.createElement(icon, { className: "h-5 w-5 text-gray-400"})}
            </div>
            <input
                {...props}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
    );
};

// --- User Registration Page Component ---
const RegisterUserPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        bloodGroup: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const payload = {
            ...formData,
            location: { // Using default coordinates for now
                type: "Point",
                coordinates: [78.4867, 17.3850] // Example: Hyderabad
            }
        };

        try {
            const response = await fetch('http://localhost:8000/api/v1/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Registration failed. Please try again.');
            }
            
            setSuccess('Registration successful! You can now log in.');
            // Optionally, you can redirect the user here, e.g., using React Router
            // navigate('/login');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a User Account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join MedSwift to get help in seconds.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input name="name" type="text" placeholder="Full Name" required icon={User} value={formData.name} onChange={handleChange} />
                        <Input name="email" type="email" placeholder="Email Address" required icon={Mail} value={formData.email} onChange={handleChange} />
                        <Input name="phone" type="tel" placeholder="Phone Number" required icon={Phone} value={formData.phone} onChange={handleChange} />
                        <Input name="password" type="password" placeholder="Password" required icon={Lock} value={formData.password} onChange={handleChange} />
                        <Input name="bloodGroup" type="text" placeholder="Blood Group (e.g., O+)" required icon={HeartPulse} value={formData.bloodGroup} onChange={handleChange} />
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {success && <p className="text-green-500 text-sm text-center">{success}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Already have an account? Sign in
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterUserPage;
