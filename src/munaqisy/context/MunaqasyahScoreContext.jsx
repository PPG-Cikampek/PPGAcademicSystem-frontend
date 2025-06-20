// MunaqasyahScoreContext.jsx
import React, { createContext, useReducer } from 'react';


const MunaqasyahScoreContext = createContext();

const initialState = {
    studentScore: [],
    studentData: [],
    selectAll: false,
    classId: null,
    classStartTime: null,
    isSubBranchMunaqasyahStarted: null,
    isBranchYearMunaqasyahStarted: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_SCORE_DATA':
            return { ...state, studentScore: action.payload };
        case 'SET_STUDENT_DATA':
            return { ...state, studentData: action.payload };
        case 'SET_IS_SUB_BRANCH_MUNAQASYAH_STARTED':
            return { ...state, isSubBranchMunaqasyahStarted: action.payload };
        case 'SET_IS_BRANCH_YEAR_MUNAQASYAH_STARTED':
            return { ...state, isBranchYearMunaqasyahStarted: action.payload };
        case 'UPDATE_SCORE_DATA':
            return {
                ...state,
                studentScore: {
                    ...state.studentScore,
                    [Object.keys(action.payload)[0]]: {
                        ...state.studentScore[Object.keys(action.payload)[0]],
                        ...action.payload[Object.keys(action.payload)[0]]
                    }
                }
            };
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

const fetchYearData = async (branchYearId, subBranchId, dispatch) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears/${branchYearId}?populate=subBranches`;

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

        console.log(data.branchYear)

        const isMunaqasyahInProgress = (data, subBranchId) => (data.teachingGroups?.flatMap(g => g.subBranches || []).find(sub => sub._id === subBranchId)?.munaqasyahStatus) === 'inProgress';

        dispatch({ type: 'SET_IS_BRANCH_YEAR_MUNAQASYAH_STARTED', payload: data.branchYear.munaqasyahStatus === 'inProgress' });
        dispatch({ type: 'SET_IS_SUB_BRANCH_MUNAQASYAH_STARTED', payload: isMunaqasyahInProgress(data.branchYear, subBranchId) });

    } catch (error) {
        console.error('Error fetching attendance data:', error);
    }

};

const fetchScoreData = async (studentNis, branchYearId, dispatch, userId) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/scores?branchYearId=${branchYearId}&&studentNis=${studentNis}`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userData')).token}`
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: header
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        const student = { ...data.scores[0].studentId, className: data.scores[0].classId.name };

        await dispatch({ type: 'SET_SCORE_DATA', payload: data.scores[0] });
        await dispatch({ type: 'SET_STUDENT_DATA', payload: student });

        patchScoreData(data.scores[0]);

    } catch (error) {
        console.error('Error fetching attendance data:', error);
    }
};

const patchScoreData = async (scoreData) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/scores/${scoreData.id}`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userData')).token}`
    }

    // console.log(state.studentScore)

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: header,
            body: JSON.stringify(scoreData)
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // dispatch({ type: 'SET_STATUS', payload: data.message });

    } catch (error) {
        console.error('Error fetching attendance data:', error);
    }
}

const MunaqasyahScoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <MunaqasyahScoreContext.Provider value={{ state, dispatch, fetchYearData, fetchScoreData, patchScoreData }}>
            {children}
        </MunaqasyahScoreContext.Provider>
    );
};

export { MunaqasyahScoreContext, MunaqasyahScoreProvider };