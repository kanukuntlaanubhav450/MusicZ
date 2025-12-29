import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", className = "", disabled = false, fullWidth = false }) => {
    const baseStyles = "px-4 py-2 rounded font-bold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";

    const variants = {
        primary: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500",
        secondary: "bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500",
        danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
        outline: "border-2 border-green-500 text-green-500 hover:bg-green-500/10 focus:ring-green-500"
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
