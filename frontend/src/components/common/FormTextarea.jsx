import React from 'react';

const FormTextarea = ({ id, name, label, value, onChange, rows = 4 }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default FormTextarea;