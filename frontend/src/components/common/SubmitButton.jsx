import React from 'react';

const SubmitButton = ({ isLoading, label, loadingLabel }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
};

export default SubmitButton;