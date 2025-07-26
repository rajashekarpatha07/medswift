import React, { useState } from "react";
import { User, Phone, Lock, Truck, ShieldAlert } from "lucide-react";

// --- Reusable Input Component ---
// This can be moved to a shared components folder, e.g., src/components/Input.jsx
const Input = ({ icon, ...props }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
      />
    </div>
  );
};

// --- Ambulance Registration Page Component ---
const RegisterAmbulancePage = () => {
  const [formData, setFormData] = useState({
    drivername: "",
    driverPhone: "",
    password: "",
    vehicleNumber: "",
    status: "ready", // Default status
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

    const payload = {
      ...formData,
      driverlocation: {
        // Field name matches the model
        type: "Point",
        coordinates: [78.4867, 17.385], // Example: Hyderabad
      },
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/ambulance/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Registration failed. Please try again."
        );
      }

      setSuccess("Ambulance registered successfully! You can now log in.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Ambulance Crew Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Register a new ambulance in the MedSwift fleet.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="drivername"
              type="text"
              placeholder="Driver's Full Name"
              required
              icon={User}
              value={formData.drivername}
              onChange={handleChange}
            />
            <Input
              name="driverPhone"
              type="tel"
              placeholder="Driver's Phone Number"
              required
              icon={Phone}
              value={formData.driverPhone}
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
            <Input
              name="vehicleNumber"
              type="text"
              placeholder="Vehicle Number (e.g., TS09AB1234)"
              required
              icon={Truck}
              value={formData.vehicleNumber}
              onChange={handleChange}
            />
            <Input
              name="status"
              type="text"
              placeholder="Initial Status"
              required
              icon={ShieldAlert}
              value={formData.status}
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
              >
                {isLoading ? "Registering..." : "Register Ambulance"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <a
              href="/ambulance/login"
              className="font-medium text-red-600 hover:text-red-500"
            >
              Already registered? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAmbulancePage;
