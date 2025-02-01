import React from 'react'

const InfoCard = ({ className, children }) => {
    return (
        <div className={`px-6 py-4 bg-white border border-gray-200 rounded-md text-gray-600 italic text-center shadow-md ${className}`} >
            {children}
        </div>
    )
}

export default InfoCard