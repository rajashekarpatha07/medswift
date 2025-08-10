import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// --- Helper Components for a Cleaner UI ---

const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
);

// A generic, reusable button for the dashboard
const ActionButton = ({ onClick, children, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-center font-bold py-3 px-4 rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none ${className}`}
  >
    {children}
  </button>
);

// --- Main Dashboard Component ---

const API_BASE_URL = "http://localhost:8000";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function DriverDashboard() {
  const [driver, setDriver] = useState(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("offline");
  const [incomingTrip, setIncomingTrip] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isCriticalModalOpen, setIsCriticalModalOpen] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(BLOOD_GROUPS[0]);
  const [hospitalResults, setHospitalResults] = useState([]);
  const [hospitalSearchMessage, setHospitalSearchMessage] = useState("");
  const [destinationHospital, setDestinationHospital] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- useEffect Hooks for Data Fetching and Sockets (Logic remains the same) ---
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/ambulance/me`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setDriver(data.ambulance);
          setStatus(data.ambulance.status);
        } else {
          console.error("Auth error:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch driver:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriver();
  }, []);

  useEffect(() => {
    if (driver) {
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);
      newSocket.emit("ambulanceConnect", { ambulanceId: driver._id });
      return () => newSocket.close();
    }
  }, [driver]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newTripRequest", (data) => {
      if (status === "ready" && !activeTrip) setIncomingTrip(data.trip);
    });
    socket.on("acceptanceConfirmed", (data) => setActiveTrip(data.trip));
    socket.on("hospitalSearchResults", (data) => {
      setHospitalSearchMessage("");
      setHospitalResults(data.hospitals);
    });
    socket.on("noHospitalsFound", (data) => {
      setHospitalSearchMessage(data.message);
      setHospitalResults([]);
    });
    socket.on("hospitalSelectionConfirmed", (data) => {
      alert(`Hospital ${data.hospital.name} has been alerted!`);
      setHospitalResults([]);
      setDestinationHospital(data.hospital);
    });
    socket.on("hospitalBedUnavailable", (data) => alert(data.message));
    socket.on("tripStatusUpdate", (data) => setActiveTrip(data.trip));
    socket.on("tripCompleted", () => {
      setActiveTrip(null);
      setHospitalResults([]);
      setHospitalSearchMessage("");
      setDestinationHospital(null);
    });
    socket.on("completionConfirmed", () => {
      alert("Trip marked as complete!");
      setActiveTrip(null);
    });
    return () => socket.off();
  }, [socket, status, activeTrip]);

  // --- Handler Functions (Logic remains the same) ---
  const handleStatusToggle = async () => {
    const newStatus = status === "ready" ? "offline" : "ready";
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ambulance/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) setStatus(data.data.status);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleAcceptTrip = () => {
    if (socket && incomingTrip) {
      socket.emit("driverAcceptedTrip", {
        tripId: incomingTrip._id,
        ambulanceId: driver._id,
      });
      setIncomingTrip(null);
    }
  };
  const handleDeclineTrip = () => setIncomingTrip(null);
  const handleStartNavigation = () => {
    if (activeTrip) {
      const [lng, lat] = activeTrip.pickupLocation.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };
  const handleNavigateToHospital = () => {
    if (destinationHospital) {
      const [lng, lat] = destinationHospital.location.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };
  const handleOpenCriticalModal = () => setIsCriticalModalOpen(true);
  const handleSearchForHospitals = () => {
    if (socket && activeTrip) {
      setHospitalSearchMessage("Searching for hospitals...");
      socket.emit("driverRequestsHospitalSearch", {
        tripId: activeTrip._id,
        bloodGroup: selectedBloodGroup,
      });
      setIsCriticalModalOpen(false);
    }
  };
  const handleSelectHospital = (hospitalId) => {
    if (socket && activeTrip) {
      socket.emit("driverSelectedHospital", {
        tripId: activeTrip._id,
        hospitalId: hospitalId,
      });
    }
  };
  const handleArrived = () => {
    if (socket && activeTrip)
      socket.emit("driverArrived", { tripId: activeTrip._id });
  };
  const handleCompleteTrip = () => {
    if (socket && activeTrip)
      socket.emit("driverCompletedTrip", { tripId: activeTrip._id });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Spinner />
        <p className="mt-4">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Driver Dashboard
          </h1>
          <p className="text-sm text-gray-500">Welcome, {driver?.drivername}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`w-3 h-3 rounded-full ${
              status === "ready" ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          ></span>
          <button
            onClick={handleStatusToggle}
            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white ${
              status === "ready" ? "bg-gray-600" : "bg-green-600"
            }`}
          >
            {status === "ready" ? "Go Offline" : "Go Ready"}
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {activeTrip ? (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b pb-3">
              Active Trip Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-blue-600">
                  {activeTrip.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="font-semibold">{activeTrip.userId.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient Phone</p>
                <a
                  href={`tel:${activeTrip.userId.phone}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {activeTrip.userId.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-bold text-red-500">
                  {activeTrip.userId.bloodGroup || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {activeTrip.status === "Accepted" && (
                <ActionButton
                  onClick={handleArrived}
                  className="bg-yellow-500 text-white"
                >
                  Mark as Arrived
                </ActionButton>
              )}
              {activeTrip.status === "Arrived" && (
                <ActionButton
                  onClick={handleCompleteTrip}
                  className="bg-green-600 text-white"
                >
                  Complete Trip
                </ActionButton>
              )}
              <ActionButton
                onClick={handleStartNavigation}
                className="bg-blue-600 text-white"
              >
                Navigate to Patient
              </ActionButton>
              {destinationHospital ? (
                <ActionButton
                  onClick={handleNavigateToHospital}
                  className="bg-teal-600 text-white"
                >
                  Navigate to {destinationHospital.name}
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={handleOpenCriticalModal}
                  className="bg-red-600 text-white"
                >
                  Critical Patient
                </ActionButton>
              )}
            </div>

            <div className="mt-6">
              {hospitalResults.length > 0 && (
                <>
                  <h3 className="font-bold text-lg mb-2">Select a Hospital:</h3>
                  <ul className="space-y-2">
                    {hospitalResults.map((h) => (
                      <li
                        key={h._id}
                        className="p-2 border rounded flex justify-between items-center"
                      >
                        <p className="font-semibold">{h.name}</p>
                        <button
                          onClick={() => handleSelectHospital(h._id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Select
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {hospitalSearchMessage && (
                <p className="text-center text-gray-600 mt-4">
                  {hospitalSearchMessage}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 pt-20">
            <h2 className="text-2xl font-semibold">You are {status}</h2>
            <p className="mt-2">
              {status === "ready"
                ? "Waiting for a new trip request."
                : "Go ready to receive trips."}
            </p>
          </div>
        )}
      </main>

      {incomingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
            <h2 className="text-4xl font-bold text-red-600 mb-4">
              INCOMING TRIP
            </h2>
            <div className="flex justify-around mt-6">
              <button
                onClick={handleDeclineTrip}
                className="px-8 py-3 bg-gray-400 text-white font-bold rounded-lg"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptTrip}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {isCriticalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">
              Select Patient's Blood Group
            </h2>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option disabled>Select Blood Group</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCriticalModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSearchForHospitals}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
