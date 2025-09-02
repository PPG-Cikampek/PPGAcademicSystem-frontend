import React from "react";

const CreateAttendanceCard = ({
    onCreate,
    isLoading,
    isBranchYearActivated,
}) => {
    return (
        <div className="card-basic m-4 justify-between items-center flex flex-col gap-2">
            <button
                onClick={onCreate}
                className="btn-mobile-primary rounded-full w-full"
                disabled={isLoading || !isBranchYearActivated}
            >
                {isLoading ? "Membuat..." : "Buat daftar hadir hari ini"}
            </button>
            {!isBranchYearActivated && (
                <span className="text-danger">
                    PJP Desa belum mengaktifkan tahun ajaran!
                </span>
            )}
        </div>
    );
};

export default CreateAttendanceCard;
