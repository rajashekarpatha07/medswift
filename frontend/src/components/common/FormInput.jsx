import React from 'react';

const FormInput = ({ id, name, type, label, value, onChange, required = false, minLength }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default FormInput;