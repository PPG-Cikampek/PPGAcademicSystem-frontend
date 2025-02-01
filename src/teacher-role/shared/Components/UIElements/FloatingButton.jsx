import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react'

const FloatingButton = ({ logo, link, color }) => {

    const navigate = useNavigate()

    const handleClick = () => {
        link && navigate(link)
    };

    return (
        <div
            className="fixed bottom-24 right-6 z-50"
        >
            <button
                onClick={handleClick}
                className={`${color || 'bg-primary active:bg-primary-darker text-white'} p-4 rounded-full shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center`}
                aria-label="Chat on WhatsApp"
            >
                {logo || <Plus />}
            </button>
        </div>
    );
};

export default FloatingButton;