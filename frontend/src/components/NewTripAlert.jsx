import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Siren } from "lucide-react";

const NewTripAlert = ({
  newTripRequest,
  handleAcceptTrip,
  setNewTripRequest,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full animate-pulse border-4 border-red-500">
      <h2 className="text-3xl font-bold text-red-600 flex items-center mb-4">
        <Siren className="mr-3" />
        New Emergency Request!
      </h2>
      <div className="mb-6 space-y-2">
        <p>
          <strong>Patient:</strong> {newTripRequest.user.name}
        </p>
        <p>
          <strong>Blood Group:</strong> {newTripRequest.user.bloodGroup}
        </p>
        <p>
          <strong>Medical History:</strong>{" "}
          {newTripRequest.user.medicalHistory || "N/A"}
        </p>
      </div>
      <div className="h-64 w-full rounded-lg overflow-hidden mb-6">
        <MapContainer
          center={newTripRequest.pickupLocation.coordinates.slice().reverse()}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={newTripRequest.pickupLocation.coordinates
              .slice()
              .reverse()}
          >
            <Popup>Pickup Location</Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="flex justify-between space-x-4">
        <button
          onClick={handleAcceptTrip}
          className="w-full py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          ACCEPT
        </button>
        <button
          onClick={() => setNewTripRequest(null)}
          className="w-full py-3 text-lg font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          REJECT
        </button>
      </div>
    </div>
  </div>
);

export default NewTripAlert;
