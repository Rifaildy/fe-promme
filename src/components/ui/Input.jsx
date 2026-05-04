import React from 'react';

const Input = ({ label, helperText, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-bold text-[#404145] mb-2">{label}</label>}
    <input 
      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none transition-shadow" 
      {...props} 
    />
    {helperText && <p className="mt-1 text-[10px] text-gray-500 italic">{helperText}</p>}
  </div>
);

export default Input;