import React from 'react';

const AlertMessage = ({ message, isSuccess }) => {
  if (!message) return null;
  return (
    <div className={`mt-4 p-4 rounded-md ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {message}
    </div>
  );
};

export default AlertMessage;