import { Link } from "react-router-dom";
import { LockOpen, Lock, KeyRound, Building } from "lucide-react";

const ClassHeader = ({
    classData,
    auth,
    lockClassHandler,
    unlockClassHandler,
}) => {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {classData.class.name}
                </h1>
                {!classData.class.isLocked &&
                    classData.class.teachingGroupId.branchYearId
                        .academicYearId.isActive === true &&
                    auth.userRole === "branchAdmin" && (
                        <button
                            onClick={() =>
                                lockClassHandler(
                                    classData.class.name,
                                    classData.class._id
                                )
                            }
                            disabled={classData.class.isLocked}
                            className={`btn-primary-outline font-medium flex flex-row items-start gap-2 ${
                                classData.class.isLocked
                                    ? "text-blue-500 disabled:opacity-100"
                                    : ""
                            }`}
                        >
                            <LockOpen size={16} />
                            Kunci Kelas
                        </button>
                    )}
                {classData.class.isLocked &&
                    classData.class.teachingGroupId.branchYearId
                        .academicYearId.isActive === true && (
                        <button
                            className={`btn-primary-outline font-medium flex flex-row items-start gap-2 text-blue-500 disabled:opacity-100`}
                            disabled
                        >
                            <Lock size={16} />
                            Kelas Dikunci
                        </button>
                    )}

                {classData.class.isLocked &&
                    classData.class.teachingGroupId.branchYearId
                        .isActive === false &&
                    auth.userRole === "branchAdmin" &&
                    classData.class.teachingGroupId.branchYearId
                        .academicYearId.isActive === true && (
                        <button
                            onClick={() =>
                                unlockClassHandler(
                                    classData.class.name,
                                    classData.class._id
                                )
                            }
                            className={`btn-danger-outline flex flex-row items-start gap-2 text-gray-600`}
                        >
                            <KeyRound size={16} />
                            Buka Kunci
                        </button>
                    )}
            </div>
            <div className="mt-2 flex items-center text-gray-500">
                <Building className="mr-2 h-4 w-4" />
                {/* <span>{classData.class.subBranchYearId.subBranchId.name} - {classData.class.subbranchYearId.academicYearId.name}</span> */}
            </div>
        </div>
    );
};

export default ClassHeader;
