import { useState } from "react";
import axios from "axios";

function UserDashboard() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve({ type: "Point", coordinates: [longitude, latitude] });
        },
        () => reject("Failed to get location")
      );
    });

  const handleEmergencyRequest = async () => {
    setLoading(true);
    setMsg("");

    try {
      const location = await getLocation();
      const res = await axios.post(
        "http://localhost:5000/api/v1/users/emergencyRequest",
        { location },
        { withCredentials: true } // in case auth cookies used
      );
      setMsg(res.data.message || "Emergency request sent successfully");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send emergency request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-700">User Dashboard</h1>
        <button
          onClick={handleEmergencyRequest}
          disabled={loading}
          className={`px-6 py-3 rounded-lg text-white text-lg font-semibold ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          } transition`}
        >
          {loading ? (
            <svg
              className="animate-spin h-6 w-6 mx-auto text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          ) : (
            "Request Emergency"
          )}
        </button>
        {msg && (
          <p className={`text-sm ${msg.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
