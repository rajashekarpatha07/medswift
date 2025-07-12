import React from 'react';
import { motion } from 'framer-motion';

const listVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

const AmbulanceList = ({ ambulances }) => {
  if (ambulances.length === 0) return null;

  return (
    <motion.div
      variants={listVariants}
      initial="initial"
      animate="animate"
      className="mt-8"
    >
      <h3 className="text-lg font-semibold text-gray-300 mb-4">
        Nearby Ambulances ({ambulances.length})
      </h3>
      <ul className="space-y-4">
        {ambulances.map((ambulance) => (
          <motion.li
            key={ambulance._id}
            variants={listItemVariants}
            className="bg-gray-800/50 p-4 rounded-lg"
          >
            <p className="text-gray-200">
              <span className="font-medium">Driver:</span> {ambulance.drivername}
            </p>
            <p className="text-gray-400 text-sm">
              <span className="font-medium">Vehicle:</span> {ambulance.vehicleNumber}
            </p>
            <p className="text-gray-400 text-sm">
              <span className="font-medium">Location:</span> Lat{" "}
              {ambulance.driverlocation.coordinates[1].toFixed(4)}, Lng{" "}
              {ambulance.driverlocation.coordinates[0].toFixed(4)}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AmbulanceList;