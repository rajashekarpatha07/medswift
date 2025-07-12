import React from 'react';

const LocationDisplay = ({ latitude, longitude, geoError }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Location
      </label>
      <div className="mt-1 text-sm text-gray-600">
        {latitude && longitude ? (
          <span>Latitude: {latitude}, Longitude: {longitude}</span>
        ) : (
          <span>Fetching location...</span>
        )}
      </div>
      {geoError && (
        <div className="mt-1 text-sm text-red-600">
          {geoError}
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;