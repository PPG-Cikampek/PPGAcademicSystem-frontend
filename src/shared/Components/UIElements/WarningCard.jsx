import React from 'react'
import { CircleAlert } from 'lucide-react'

const WarningCard = props => {
    return (
        <div
            onClick={props.onClick}
            className={`flex font-normal w-full bg-orange-100 border border-orange-400 text-orange-700 px-4 py-4 rounded-sm relative mb-4 ${props.className}`}
            role="alert"
        >
            <span><CircleAlert size={18}/></span>
            <span className='ml-2'>{props.warning}</span>
        </div>
    )
}

export default WarningCard