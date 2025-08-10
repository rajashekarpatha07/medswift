import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Define custom icons for each status
const readyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const onTripIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const offlineIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getIcon = (status) => {
  switch (status) {
    case "ready":
      return readyIcon;
    case "on-trip":
      return onTripIcon;
    default:
      return offlineIcon;
  }
};

function FleetMap({ ambulances }) {
  // Default map center to Hyderabad
  const mapCenter = [17.385, 78.4867];

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {ambulances.map((amb) => (
        <Marker
          key={amb._id}
          position={[
            amb.driverlocation.coordinates[1],
            amb.driverlocation.coordinates[0],
          ]}
          icon={getIcon(amb.status)}
        >
          <Popup>
            <strong>{amb.drivername}</strong>
            <br />
            Status: {amb.status}
            <br />
            Vehicle: {amb.vehicleNumber}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default FleetMap;
