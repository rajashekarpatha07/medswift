import { useState } from "react";
import axios from "../../../axios.js";
import { Link, useNavigate } from "react-router-dom";

function AmbulanceRegister() {
  const [form, setForm] = useState({
    drivername: "",
    driverPhone: "",
    password: "",
    vechileNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const driverlocation = await getLocation();

      const res = await axios.post("http://localhost:5000/api/v1/ambulance/register", {
        ...form,
        driverlocation,
      });

      setMsg(res.data.message);
      navigate("/ambulance/login");
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border"
      >
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-6">MedSwift</h1>
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Ambulance Register</h2>

        {["drivername", "driverPhone", "vechileNumber"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field === "vechileNumber" ? "Vehicle Number" : field.replace("driver", "Driver ")}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        ))}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all ${
            loading && "opacity-50 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Registering...
            </>
          ) : (
            "Register"
          )}
        </button>

        {msg && (
          <p className="text-center text-sm font-medium text-red-600">{msg}</p>
        )}

        <p className="text-center mt-4 text-sm">
          Already registered?{" "}
          <Link to="/ambulance/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default AmbulanceRegister;
