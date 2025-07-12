import React from 'react';
import { motion } from 'framer-motion';
import { Power, PowerOff } from 'lucide-react';

const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.2, type: 'spring' },
  }),
  hover: { scale: 1.05, transition: { duration: 0.3, type: 'spring' } },
  tap: { scale: 0.95 },
};

const StatusButtons = ({ currentStatus, onStatusUpdate, isLoading, hasLocationError }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <motion.button
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        custom={0}
        whileHover="hover"
        whileTap="tap"
        onClick={() => onStatusUpdate('ready')}
        disabled={isLoading || hasLocationError || currentStatus === 'ready'}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
          currentStatus === 'ready'
            ? 'bg-green-600/50 text-green-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-600/30'
        } ${isLoading || hasLocationError ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Power size={20} />
        Set Ready
      </motion.button>
      <motion.button
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        custom={1}
        whileHover="hover"
        whileTap="tap"
        onClick={() => onStatusUpdate('offline')}
        disabled={isLoading || hasLocationError || currentStatus === 'offline'}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
          currentStatus === 'offline'
            ? 'bg-red-600/50 text-red-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-600/30'
        } ${isLoading || hasLocationError ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <PowerOff size={20} />
        Set Offline
      </motion.button>
    </div>
  );
};

export default StatusButtons;