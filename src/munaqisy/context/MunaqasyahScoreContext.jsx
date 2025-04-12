// MunaqasyahScoreContext.jsx
import React, { createContext, useReducer, useEffect } from 'react';

const MunaqasyahScoreContext = createContext();

const initialState = {
    studentList: [],
    selectAll: false,
    classId: null,
    classStartTime: null,
    isTeachingGroupYearMunaqasyahStarted: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_IS_MUNAQASYAH_STARTED':
            return { ...state, isTeachingGroupYearMunaqasyahStarted: action.payload };
        case 'TOGGLE_SELECTED':
            return {
                ...state,
                studentList: state.studentList.map(student =>
                    student.studentId.nis === action.payload.id
                        ? { ...student, isSelected: !student.isSelected }
                        : student
                ),
            };
        case 'TOGGLE_SELECT_ALL':
            return {
                ...state,
                selectAll: !state.selectAll,
                studentList: state.studentList.map(student =>
                    student.status === 'Hadir' || student.status === 'Terlambat'
                        ? { ...student, isSelected: false }
                        : student.status !== 'Hadir' || student.status === 'Terlambat'
                            ? { ...student, isSelected: !state.selectAll }
                            : student
                ),
            };
        default:
            return state;
    }
};

const fetchYearData = async (teachingGroupYearId, dispatch) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroupYears/${teachingGroupYearId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        console.log(data.teachingGroupYear)

        dispatch({ type: 'SET_IS_MUNAQASYAH_STARTED', payload: data.teachingGroupYear.isMunaqasyahActive });

    } catch (error) {
        console.error('Error fetching attendance data:', error);
    }

};

const MunaqasyahScoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <MunaqasyahScoreContext.Provider value={{ state, dispatch, fetchYearData }}>
            {children}
        </MunaqasyahScoreContext.Provider>
    );
};

export { MunaqasyahScoreContext, MunaqasyahScoreProvider };