import React from "react";
import { useNavigate } from "react-router-dom";

import { ChevronLeft } from "lucide-react";

const BackButton = ({ label = "kembali", className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`px-4 pl-2 py-2 border border-gray-300 text-gray-700 font-normal rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors duration-200 ease-in-out ${className}`}
    >
      <span className="flex items-center"><ChevronLeft size={20}/> {label}</span>
    </button>
  );
};

export default BackButton;
