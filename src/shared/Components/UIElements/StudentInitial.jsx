import React from 'react'

const StudentInitial = ({ studentName, clsName }) => {

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`${clsName}`}>
            {getInitials(studentName)}
        </div>
    )
};

export default StudentInitial