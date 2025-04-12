import React, { useContext } from 'react'
import CurrentDate from './CurrentDate'
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter'

const StatusBar = ({ academicYear, children }) => {
    return (
        <div className='card-basic flex-col mx-4 mb-0 justify-between items-start'>
            {children ? children : <CurrentDate />}

            {!children && academicYear && (
                <div className="mt-2 text-2xl font-bold">
                    {academicYearFormatter(academicYear)}
                </div>
            )}
        </div>
    )
}

export default StatusBar