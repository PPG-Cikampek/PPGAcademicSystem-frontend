import React from 'react'

const ErrorCard = props => {
    return (
        <div className={`text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm relative mb-4 ${props.className}}`} role="alert">
            {/* <strong className="font-bold">Error!</strong> */}
            <p className="block font-medium sm:inline"> {props.error}</p>
        </div>
    )
}

export default ErrorCard