import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import StatusTracker from "../../components/StatusTracker";
// Add these missing imports:
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  User,
  Mail,
  Phone,
  HeartPulse,
  Siren,
  Loader,
  Truck,
} from "lucide-react";

// --- Main User Dashboard Component ---
const DashboardUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [tripStatus, setTripStatus] = useState(null);
  const [ambulanceDetails, setAmbulanceDetails] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [socketError, setSocketError] = useState(null);
  const socketRef = useRef(null);

  // --- Effect to fetch user data on mount ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/user/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Authentication failed. Please log in again."
          );
        }
        setUser(data.user);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // --- Effect to manage Socket.IO connection ---
  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:8000");
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to server!");
      socket.emit("userConnect", { userId: user._id });
    });

    socket.on("tripStatusUpdate", (data) => {
      console.log("Trip status update received:", data);
      setTripStatus(data.status);
      if (data.ambulance) {
        setAmbulanceDetails(data.ambulance);
      }
    });

    socket.on("ambulanceLocationForUser", (data) => {
      console.log("Ambulance location received:", data.coordinates);
      setAmbulanceLocation(data.coordinates);
    });

    socket.on("tripError", (data) => {
      console.error("Trip Error:", data.message);
      setSocketError(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleEmergencyRequest = () => {
    setSocketError(null);
    setTripStatus("Pending");
    socketRef.current.emit("emergencyRequestFromUser", {
      userId: user._id,
      location: user.location,
      medicalHistory: user.medicalHistory,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700">Loading Dashboard...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-700 mt-2">{fetchError}</p>
        <a
          href="/login"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Your personal emergency dashboard.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <User className="mr-2" /> Your Profile
              </h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-3" />
                  {user.email}
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-3" />
                  {user.phone}
                </p>
                <p className="flex items-center">
                  <HeartPulse className="w-4 h-4 mr-3" />
                  Blood Group: {user.bloodGroup}
                </p>
              </div>
            </div>

            {ambulanceDetails && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  <Truck className="mr-2 text-blue-600" /> Assigned Ambulance
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Driver:</strong> {ambulanceDetails.drivername}
                  </p>
                  <p>
                    <strong>Vehicle:</strong> {ambulanceDetails.vehicleNumber}
                  </p>
                  <p>
                    <strong>Phone:</strong> {ambulanceDetails.driverPhone}
                  </p>
                </div>
              </div>
            )}

            {!tripStatus && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-xl mb-4">Need Help?</h3>
                <button
                  onClick={handleEmergencyRequest}
                  className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
                >
                  <Siren className="mr-3" /> REQUEST EMERGENCY TRIP
                </button>
                {socketError && (
                  <p className="text-red-500 text-sm text-center mt-4">
                    {socketError}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            {tripStatus ? (
              <div className="space-y-6">
                <StatusTracker tripStatus={tripStatus} />
                <div className="h-96 w-full rounded-lg overflow-hidden">
                  {user.location && user.location.coordinates ? (
                    <MapContainer
                      center={user.location.coordinates.slice().reverse()}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={user.location.coordinates.slice().reverse()}
                      >
                        <Popup>Your Location</Popup>
                      </Marker>
                      {ambulanceLocation && (
                        <Marker position={ambulanceLocation.slice().reverse()}>
                          <Popup>Ambulance Location</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p>Loading map...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-blue-100 text-blue-800 rounded-full mb-4">
                  <HeartPulse size={48} />
                </div>
                <h2 className="text-2xl font-bold">
                  You have no active trips.
                </h2>
                <p className="text-gray-600 mt-2">
                  Press the emergency button if you need assistance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
