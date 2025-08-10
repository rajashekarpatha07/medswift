import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Simple custom icon for ambulance
const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448624.png",
  iconSize: [40, 40],
});

function MapComponent({ userLocation, ambulanceLocation }) {
  return (
    <MapContainer
      center={userLocation}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* User's Location Marker */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {/* Ambulance Location Marker */}
      {ambulanceLocation && (
        <Marker position={ambulanceLocation} icon={ambulanceIcon}>
          <Popup>Ambulance</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapComponent;
