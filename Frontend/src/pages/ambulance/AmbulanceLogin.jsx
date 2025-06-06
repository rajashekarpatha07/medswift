import { useState } from "react";
import axios from "../../../axios.js";
import { Link } from "react-router-dom";

function AmbulanceLogin() {
  const [form, setForm] = useState({
    driverPhone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
//   const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await axios.post("http://localhost:5000/api/v1/ambulance/login", form);
      setMsg(res.data.message);

      // Assuming you get a token or user info here to store/session
      // localStorage.setItem('token', res.data.token);

    //   navigate("/ambulance/dashboard");
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid credentials");
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
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Ambulance Login</h2>

        <input
          type="text"
          name="driverPhone"
          value={form.driverPhone}
          onChange={handleChange}
          placeholder="Driver Phone"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
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
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {msg && (
          <p className="text-center text-sm font-medium text-red-600">{msg}</p>
        )}

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/ambulance/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default AmbulanceLogin;
