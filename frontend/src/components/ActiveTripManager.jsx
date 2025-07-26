import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const ActiveTripManager = ({ activeTrip, handleUpdateTripStatus }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="font-bold text-2xl mb-4">
      Active Trip: Pick up {activeTrip.user.name}
    </h3>
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleUpdateTripStatus("En-route", "ambulanceEnRoute")}
          className="py-3 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          I'm En-Route
        </button>
        <button
          onClick={() => handleUpdateTripStatus("Arrived", "ambulanceArrived")}
          className="py-3 font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
        >
          I Have Arrived
        </button>
        <button
          onClick={() => handleUpdateTripStatus("Completed", "tripCompleted")}
          className="py-3 font-semibold text-white bg-purple-500 rounded-md hover:bg-purple-600"
        >
          Trip Complete
        </button>
      </div>
      <div className="h-80 w-full rounded-lg overflow-hidden">
        <MapContainer
          center={activeTrip.pickupLocation.coordinates.slice().reverse()}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={activeTrip.pickupLocation.coordinates.slice().reverse()}
          >
            <Popup>Destination</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  </div>
);

export default ActiveTripManager;
