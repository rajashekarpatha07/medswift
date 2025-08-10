import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MapComponent from "../../components/MapComponent";

// --- Helper Components for a Cleaner UI ---

// Loading Spinner Component
const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);

// Icon for the Request Button
const SirenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 mr-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

// --- Main Dashboard Component ---

const API_BASE_URL = "http://localhost:8000";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [ambulanceDetails, setAmbulanceDetails] = useState(null);
  const [tripStatus, setTripStatus] = useState("Not Requested");
  const [tripId, setTripId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial profile load

  // Effect to fetch user data on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/user/me`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        } else {
          console.error("Auth error:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Effect to connect to socket after user is fetched
  useEffect(() => {
    if (user) {
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);
      newSocket.emit("userConnect", { userId: user._id });
      return () => newSocket.close();
    }
  }, [user]);

  // Effect to get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        // Use watchPosition for continuous updates
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => console.error("Error getting geolocation:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Effect to listen for all server events
  useEffect(() => {
    if (!socket) return;

    socket.on("tripInitiated", (data) => {
      setTripStatus("Searching for an ambulance...");
      setTripId(data.tripId);
    });
    socket.on("tripAccepted", (data) => {
      setTripStatus("Ambulance is on the way!");
      if (data.trip.ambulanceId) {
        setAmbulanceDetails(data.trip.ambulanceId);
        const [lng, lat] = data.trip.ambulanceId.driverlocation.coordinates;
        setAmbulanceLocation([lat, lng]);
      }
    });
    socket.on("ambulanceLocationUpdated", (data) => {
      const [lng, lat] = data.location.coordinates;
      setAmbulanceLocation([lat, lng]);
    });
    socket.on("noAmbulancesFound", (data) => setTripStatus(data.message));
    socket.on("tripError", (data) => setTripStatus(data.message));
    socket.on("tripCompleted", (data) => {
      setTripStatus("Trip Completed. Thank you!");
      setAmbulanceLocation(null);
      setAmbulanceDetails(null);
      setTripId(null);
    });
    socket.on("adminMessage", (data) => setTripStatus(data.message));
    socket.on("tripStatusUpdate", (data) =>
      setTripStatus(`Ambulance has ${data.trip.status}!`)
    );

    return () => socket.off();
  }, [socket]);

  const handleRequestAmbulance = () => {
    if (socket && userLocation && user) {
      setTripStatus("Requesting...");
      socket.emit("emergencyRequestFromUser", {
        userId: user._id,
        location: {
          type: "Point",
          coordinates: [userLocation[1], userLocation[0]],
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Spinner />
        <p className="text-xl font-semibold mt-4 text-gray-600">
          Loading Your Profile...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-red-500">
          Could not load profile. Please try logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white text-gray-800 p-4 text-center shadow-md z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
          MedSwift
        </h1>
        <p className="text-sm text-gray-500">Welcome, {user.name}</p>
      </header>

      <main className="flex-grow relative">
        {userLocation ? (
          <MapComponent
            userLocation={userLocation}
            ambulanceLocation={ambulanceLocation}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-200">
            <Spinner />
            <p className="text-lg font-semibold mt-4 text-gray-600">
              Acquiring your location...
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white p-4 shadow-lg text-center border-t-2 border-gray-100">
        <button
          onClick={handleRequestAmbulance}
          disabled={!userLocation || !!tripId}
          className="w-full max-w-md mx-auto flex items-center justify-center bg-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-70 animate-pulse-slow"
        >
          <SirenIcon />
          <span className="text-xl">Request Ambulance</span>
        </button>
        <p className="mt-3 font-semibold text-lg text-gray-700">{tripStatus}</p>

        {ambulanceDetails && (
          <div className="mt-4 max-w-md mx-auto p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-left shadow-sm">
            <h3 className="text-md font-bold text-blue-800">
              Your Ambulance Details
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              <p>
                <strong>Driver:</strong> {ambulanceDetails.drivername}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a
                  href={`tel:${ambulanceDetails.driverPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {ambulanceDetails.driverPhone}
                </a>
              </p>
              <p>
                <strong>Vehicle #:</strong> {ambulanceDetails.vehicleNumber}
              </p>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

export default UserDashboard;
