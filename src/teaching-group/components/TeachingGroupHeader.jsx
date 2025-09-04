import { Layers2, Lock, LockOpen, MapPin, Presentation } from "lucide-react";

const TeachingGroupHeader = ({
    teachingGroupData,
    auth,
    lockTeachingGroupHandler,
    teachingGroupId,
}) => {
    return (
        <div className="mb-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Detail KBM
                </h1>
                <div className="card-basic flex-col md:flex-row justify-between md:items-center rounded-md m-0 mb-2">
                    <div className="flex flex-col gap-2">
                        <h1 className="flex items-center gap-2 text-xl font-medium text-gray-900 mb-2">
                            KBM {teachingGroupData?.name}
                            <span
                                className={`inline-block p-1 rounded-md border-2 ${
                                    teachingGroupData?.isLocked
                                        ? "border-blue-500 text-blue-500"
                                        : "border-red-500 text-red-500"
                                }`}
                            >
                                {teachingGroupData?.isLocked ? (
                                    <Lock size={16} />
                                ) : (
                                    <LockOpen size={16} />
                                )}
                            </span>
                        </h1>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin className="h-5 w-5" />
                            <span>
                                Tempat Kegiatan KBM:{" "}
                                {teachingGroupData?.address}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Layers2 className="h-5 w-5" />
                            <span>
                                Jumlah Kelompok:{" "}
                                {teachingGroupData?.subBranches?.length || "0"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Presentation className="h-5 w-5" />
                            <span>
                                Jumlah Kelas:{" "}
                                {teachingGroupData?.classes?.length || "0"}
                            </span>
                        </div>
                    </div>
                    <div>
                        {teachingGroupData?.branchYearId?.isActive === false &&
                            teachingGroupData?.branchYearId?.academicYearId
                                .isActive === true &&
                            auth.userRole === "branchAdmin" &&
                            teachingGroupData?.isLocked === true && (
                                <button
                                    className="button-danger"
                                    onClick={() =>
                                        lockTeachingGroupHandler(
                                            "unlock",
                                            teachingGroupId
                                        )
                                    }
                                >
                                    Buka KBM
                                </button>
                            )}

                        {teachingGroupData?.branchYearId?.isActive === false &&
                            teachingGroupData?.branchYearId?.academicYearId
                                .isActive === true &&
                            teachingGroupData?.isLocked === false &&
                            auth.userRole === "branchAdmin" && (
                                <button
                                    className="button-primary"
                                    onClick={() =>
                                        lockTeachingGroupHandler(
                                            "lock",
                                            teachingGroupId
                                        )
                                    }
                                >
                                    Kunci KBM
                                </button>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeachingGroupHeader;
