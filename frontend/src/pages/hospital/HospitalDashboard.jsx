import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// --- Helper Components ---
const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
);

// --- Main Dashboard Component ---
const API_BASE_URL = "http://localhost:8000";

function HospitalDashboard() {
  const [hospital, setHospital] = useState(null);
  const [socket, setSocket] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [incomingPatientAlert, setIncomingPatientAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch hospital data and initial inventory on load
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/hospital/me`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setHospital(data.hospital);
          setInventory(data.hospital.inventory);
        } else {
          console.error("Auth Error:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch hospital data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitalData();
  }, []);

  // Connect to socket server after hospital data is fetched
  useEffect(() => {
    if (hospital) {
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);
      newSocket.emit("hospitalConnect", { hospitalId: hospital._id });

      return () => newSocket.close();
    }
  }, [hospital]);

  // Listen for critical patient alerts
  useEffect(() => {
    if (socket) {
      socket.on("criticalPatientAlert", (data) => {
        setIncomingPatientAlert(data);
        // Optional: Play a sound
        // const alertSound = new Audio('/alert.mp3');
        // alertSound.play();
      });
    }
    return () => {
      if (socket) socket.off("criticalPatientAlert");
    };
  }, [socket]);

  // Handler for form input changes
  const handleInventoryChange = (e) => {
    const { name, value } = e.target;
    const [category, subkey] = name.split(".");

    setInventory((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subkey]: parseInt(value, 10) || 0,
      },
    }));
  };

  // Handler for submitting the inventory update
  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/hospital/inventory`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ inventory }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Inventory updated successfully!");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Failed to update inventory:", error);
      alert("Error: Could not update inventory.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <Spinner />
        <p className="mt-4">Loading Hospital Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Hospital Dashboard
        </h1>
        <p className="text-sm text-gray-500">Welcome, {hospital?.name}</p>
      </header>

      <main className="p-4 md:p-6">
        <form
          onSubmit={handleUpdateInventory}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-4">Manage Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-2">Beds</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Beds
                </label>
                <input
                  type="number"
                  name="beds.total"
                  value={inventory?.beds.total || 0}
                  onChange={handleInventoryChange}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Available Beds
                </label>
                <input
                  type="number"
                  name="beds.available"
                  value={inventory?.beds.available || 0}
                  onChange={handleInventoryChange}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">
                Blood Stock (Units)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {inventory &&
                  Object.keys(inventory.bloodStock).map((bloodType) => (
                    <div key={bloodType}>
                      <label className="block text-sm font-medium text-gray-700">
                        {bloodType.replace("_", " ")}
                      </label>
                      <input
                        type="number"
                        name={`bloodStock.${bloodType}`}
                        value={inventory.bloodStock[bloodType] || 0}
                        onChange={handleInventoryChange}
                        className="w-full p-2 border rounded mt-1"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isUpdating ? "Updating..." : "Update Inventory"}
          </button>
        </form>
      </main>

      {incomingPatientAlert && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-[1500] p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl text-center border-4 border-red-500 animate-pulse">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-red-600 mb-4">
              CRITICAL PATIENT INCOMING
            </h2>
            <div className="text-left space-y-3 text-base sm:text-lg">
              <p>
                <strong>Patient Name:</strong>{" "}
                {incomingPatientAlert.patientDetails.name}
              </p>
              <p>
                <strong>Blood Group Required:</strong>{" "}
                <span className="font-bold">
                  {incomingPatientAlert.patientDetails.bloodGroup}
                </span>
              </p>
              <p>
                <strong>Medical History:</strong>{" "}
                {incomingPatientAlert.patientDetails.medicalHistory || "N/A"}
              </p>
            </div>
            <button
              onClick={() => setIncomingPatientAlert(null)}
              className="mt-8 px-12 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;
