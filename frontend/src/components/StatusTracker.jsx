import React from "react";

const StatusTracker = ({ tripStatus }) => {
  const statuses = ["Pending", "Accepted", "En-route", "Arrived"];
  const currentIndex = statuses.indexOf(tripStatus);
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold text-lg mb-4">Trip Status</h3>
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300"
                }`}
              >
                {index < currentIndex ? "✔" : index + 1}
              </div>
              <p
                className={`mt-2 text-xs sm:text-sm ${
                  index <= currentIndex ? "font-semibold" : ""
                }`}
              >
                {status}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatusTracker;
