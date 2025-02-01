import React, { useContext } from 'react'

import { StudentAttendanceContext } from '../context/StudentAttendanceContext';

const ScanCounter = () => {

  const { state, dispatch } = useContext(StudentAttendanceContext);

  return (
    <div className='border-2 border-primary rounded-full p-2 text-medium text-primary'>
        {state.studentList.filter(student => student.status === 'Hadir').length}/{state.studentList.length}
    </div>
  )
}

export default ScanCounter