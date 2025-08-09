import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Create the routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]), // Start coordinates (ambulance)
        L.latLng(end[0], end[1]), // End coordinates (user)
      ],
      routeWhileDragging: true,
      // Hides the turn-by-turn instructions panel
      show: false,
      // Customizes the appearance of the route line
      lineOptions: {
        styles: [{ color: "#3b82f6", opacity: 0.8, weight: 6 }],
      },
      // You can provide custom icons for the start and end markers
      createMarker: function () {
        return null;
      }, // Return null to use your existing markers
    }).addTo(map);

    // Cleanup function to remove the control when the component unmounts
    return () => map.removeControl(routingControl);
  }, [map, start, end]); // Rerun this effect if the map or coordinates change

  return null; // This component does not render anything itself
};

export default RoutingMachine;
