import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import FleetMap from "../../components/FleetMap";

const API_BASE_URL = "http://localhost:8000";

function AdminDashboard() {
  const [socket, setSocket] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [escalatedTrips, setEscalatedTrips] = useState([]);
  const [tripToView, setTripToView] = useState(null);

  // Fetch initial data on load
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const ambulancesRes = await fetch(
          `${API_BASE_URL}/api/v1/admin/ambulances`,
          { credentials: "include" }
        );
        const ambulancesData = await ambulancesRes.json();
        if (ambulancesRes.ok) setAmbulances(ambulancesData.data);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    };
    fetchAmbulances();
  }, []);

  // Connect to socket and listen for real-time updates
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);
    newSocket.emit("adminConnect");

    newSocket.on("ambulanceStatusUpdate", (updatedAmbulance) => {
      setAmbulances((prevAmbulances) =>
        prevAmbulances.map((amb) =>
          amb._id === updatedAmbulance._id ? updatedAmbulance : amb
        )
      );
    });

    newSocket.on("requestToAdmin", (data) => {
      setEscalatedTrips((prevTrips) => [data.trip, ...prevTrips]);
    });

    return () => newSocket.close();
  }, []);

  // Handler for the "Notify User" button
  const handleNotifyUser = () => {
    if (socket && tripToView) {
      socket.emit("adminNotifiesUser", {
        userId: tripToView.userId._id,
        message:
          "Help is on the way. An ambulance is being assigned to you manually.",
      });
      alert("User has been notified!");
    }
  };

  return (
    <div className="p-4 md:p-6 relative">
      <header className="mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-200 h-96 mb-6 rounded-lg shadow-inner">
            <FleetMap ambulances={ambulances} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">Ambulance Fleet Status</h2>
            <div className="max-h-96 overflow-y-auto">
              <ul className="space-y-2">
                {ambulances.map((amb) => (
                  <li
                    key={amb._id}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <span>
                      {amb.drivername} ({amb.vehicleNumber})
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                        amb.status === "ready"
                          ? "bg-green-500"
                          : amb.status === "on-trip"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {amb.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-3 text-red-600">
            Escalated Trips
          </h2>
          <div className="max-h-[30rem] overflow-y-auto">
            <ul className="space-y-3">
              {escalatedTrips.length > 0 ? (
                escalatedTrips.map((trip) => (
                  <li
                    key={trip._id}
                    className="p-2 border rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm">
                        <strong>User:</strong> {trip.userId.name}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong> {trip.status}
                      </p>
                    </div>
                    <button
                      onClick={() => setTripToView(trip)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No escalated trips right now.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {tripToView && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1200]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg text-left">
            <h2 className="text-2xl font-bold mb-4">Escalated Trip Details</h2>
            <div className="space-y-2">
              <p>
                <strong>User Name:</strong> {tripToView.userId.name}
              </p>
              <p>
                <strong>User Phone:</strong>{" "}
                <a
                  href={`tel:${tripToView.userId.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {tripToView.userId.phone}
                </a>
              </p>
              <p>
                <strong>Location (Lng, Lat):</strong>{" "}
                {tripToView.pickupLocation.coordinates.join(", ")}
              </p>
            </div>
            <button
              onClick={handleNotifyUser}
              className="mt-6 w-full bg-green-600 text-white font-bold p-2 rounded hover:bg-green-700"
            >
              Notify User: "Help is on the way"
            </button>
            <button
              onClick={() => setTripToView(null)}
              className="mt-2 w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
