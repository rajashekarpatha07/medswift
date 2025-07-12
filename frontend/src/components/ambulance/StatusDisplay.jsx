import React from 'react';

const StatusDisplay = ({ status, latitude, longitude }) => {
  return (
    <div className="text-center mb-8">
      <p className="text-lg sm:text-xl text-gray-300">
        Current Status: <span className="font-semibold text-blue-400">{status}</span>
      </p>
      {latitude && longitude && (
        <p className="text-sm text-gray-400 mt-2">
          Location: Lat {latitude.toFixed(4)}, Lng {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default StatusDisplay;