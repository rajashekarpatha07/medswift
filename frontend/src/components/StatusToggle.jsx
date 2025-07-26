import React from "react";
import { Power, PowerOff } from "lucide-react";

const StatusToggle = ({ status, setStatus }) => (
  <div className="flex items-center space-x-4">
    <span className="font-semibold">Your Status:</span>
    <button
      onClick={() => setStatus("ready")}
      className={`px-4 py-2 rounded-md flex items-center transition-colors ${
        status === "ready" ? "bg-green-500 text-white" : "bg-gray-200"
      }`}
    >
      <Power className="mr-2 h-4 w-4" /> Ready
    </button>
    <button
      onClick={() => setStatus("offline")}
      className={`px-4 py-2 rounded-md flex items-center transition-colors ${
        status === "offline" ? "bg-red-500 text-white" : "bg-gray-200"
      }`}
    >
      <PowerOff className="mr-2 h-4 w-4" /> Offline
    </button>
  </div>
);

export default StatusToggle;
