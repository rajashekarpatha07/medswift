import React, { useState } from "react";
import { Phone, Lock } from "lucide-react";

// --- Reusable Input Component ---
const Input = ({ icon, ...props }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
};

// --- User Login Page Component ---
const LoginUserPage = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Login failed. Please check your credentials."
        );
      }

      setSuccess(`Welcome back, ${result.data.name}! Redirecting...`);

      // --- REDIRECTION LOGIC ---
      // After a short delay to show the success message, redirect the user.
      setTimeout(() => {
        window.location.href = "/dashboard"; // This will navigate to the dashboard page
      }, 1500); // 1.5-second delay
    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Ensure loading stops on error
    }
    // We don't set isLoading to false in the success case because the page will redirect.
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your MedSwift profile.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              required
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-sm text-center">{success}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUserPage;
