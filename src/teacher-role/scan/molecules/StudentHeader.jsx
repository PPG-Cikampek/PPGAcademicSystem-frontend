import React from "react";
import StudentInitial from "../../../shared/Components/UIElements/StudentInitial";

const StudentHeader = ({ student }) => {
    return (
        <div className="flex gap-2 items-center mb-2">
            {student.studentId.image ? (
                <img
                    src={
                        student.studentId.thumbnail
                            ? student.studentId.thumbnail
                            : `${import.meta.env.VITE_BACKEND_URL}/${
                                  student.studentId.image
                              }`
                    }
                    alt="Profile"
                    className="rounded-full size-10 shrink-0 border border-gray-200 bg-white"
                />
            ) : (
                <StudentInitial
                    studentName={student.studentId.name}
                    clsName="size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium"
                />
            )}
            <div className="flex flex-col">
                <div className="uppercase">{student.studentId.name}</div>
                <div className="text-xs text-gray-800">
                    {student.studentId.nis}
                </div>
            </div>
        </div>
    );
};

export default StudentHeader;
