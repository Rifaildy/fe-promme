import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-semibold rounded-md px-5 py-2.5 transition-all duration-200 flex items-center justify-center text-sm";
  const variants = {
    primary: "bg-[#1dbf73] text-white hover:bg-[#19a463]",
    outline: "border-2 border-[#1dbf73] text-[#1dbf73] hover:bg-[#1dbf73] hover:text-white",
    ghost: "text-[#7a7d85] hover:text-[#404145] hover:bg-gray-100",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;