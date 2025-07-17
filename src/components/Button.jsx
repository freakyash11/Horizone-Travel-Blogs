import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-blue-600",
    textColor = "text-white",
    className = "",
    disabled = false,
    ...props
}) {
    return (
        <button 
            className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${className} ${
                disabled ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90 transition-all'
            }`} 
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
