import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import StatusToggle from "../../components/StatusToggle";
import NewTripAlert from "../../components/NewTripAlert";
import ActiveTripManager from "../../components/ActiveTripManager";
// Add these missing imports:
import { Loader, Truck, Siren, PowerOff } from "lucide-react";

// --- Main Ambulance Dashboard Component ---
const DashboardAmbulance = () => {
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [newTripRequest, setNewTripRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [status, setStatus] = useState("offline"); // Driver's controllable status
  const socketRef = useRef(null);

  // --- Effect to fetch ambulance data on mount ---
  useEffect(() => {
    const fetchAmbulanceData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/ambulance/me",
          {
            method: "GET",
            credentials: "include", // Important for sending cookies
          }
        );
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Authentication failed. Please log in again."
          );
        }
        setAmbulance(data.ambulance);
        setStatus(data.ambulance.status || "offline");
      } catch (error) {
        console.error("Fetch error:", error);
        setFetchError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAmbulanceData();
  }, []);

  // --- Effect to manage Socket.IO connection ---
  useEffect(() => {
    if (!ambulance) return;

    socketRef.current = io("http://localhost:8000");
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to server!");
      socket.emit("ambulanceConnect", { ambulanceId: ambulance._id });
    });

    socket.on("newTripRequest", (data) => {
      console.log("New trip request received:", data);
      setNewTripRequest(data);
    });

    return () => socket.disconnect();
  }, [ambulance]);

  // --- Handlers for trip management ---
  const handleAcceptTrip = () => {
    socketRef.current.emit("tripAcceptedByAmbulance", {
      tripId: newTripRequest.tripId,
    });
    setActiveTrip(newTripRequest); // Move the request to an active trip state
    setNewTripRequest(null); // Clear the new request alert
  };

  const handleUpdateTripStatus = (newStatus, eventName) => {
    socketRef.current.emit(eventName, { tripId: activeTrip.tripId });
    // Optimistically update UI or wait for confirmation
    setActiveTrip((prev) => ({ ...prev, status: newStatus }));
    if (newStatus === "Completed") {
      // Reset state after trip completion
      setActiveTrip(null);
      setStatus("ready"); // Set driver back to ready
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-red-600" />
      </div>
    );
  if (fetchError)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-red-600">{fetchError}</h2>
        <a href="/ambulance/login">Go to Login</a>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {newTripRequest && (
        <NewTripAlert
          newTripRequest={newTripRequest}
          handleAcceptTrip={handleAcceptTrip}
          setNewTripRequest={setNewTripRequest}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {ambulance.drivername}!
          </h1>
          <StatusToggle status={status} setStatus={setStatus} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-xl mb-4 flex items-center">
              <Truck className="mr-2" /> Your Vehicle
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Driver:</strong> {ambulance.drivername}
              </p>
              <p>
                <strong>Phone:</strong> {ambulance.driverPhone}
              </p>
              <p>
                <strong>Vehicle No:</strong> {ambulance.vehicleNumber}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeTrip ? (
              <ActiveTripManager
                activeTrip={activeTrip}
                handleUpdateTripStatus={handleUpdateTripStatus}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-full text-center">
                <div
                  className={`p-4 rounded-full mb-4 ${
                    status === "ready"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {status === "ready" ? (
                    <Siren size={48} />
                  ) : (
                    <PowerOff size={48} />
                  )}
                </div>
                <h2 className="text-2xl font-bold">
                  You are currently {status.toUpperCase()}
                </h2>
                <p className="text-gray-600 mt-2">
                  {status === "ready"
                    ? "Waiting for new trip requests."
                    : "You will not receive any requests."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAmbulance;
