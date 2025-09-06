import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { attendanceCount } from "../../shared/Utilities/attendanceCount";
import useHttp from "../../shared/hooks/http-hook";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

const ClassesViewByAcademicYear = () => {
    const [academicYear, setAcademicYears] = useState();
    const { isLoading, error, sendRequest } = useHttp();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    console.log(auth.userSubBranchId);

    useEffect(() => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/classes`;

        const fetchClasses = async () => {
            console.log(url);
            try {
                const responseData = await sendRequest(url);
                setAcademicYears(responseData.academicYears);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchClasses();
    }, [sendRequest]);

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Pilih Tahun Ajaran
                    </h1>
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {academicYear && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                        {academicYear.map((year) => (
                            <div
                                key={year._id}
                                className="card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start  md:p-8 m-0 w-full h-full cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        "/dashboard/classes/academic-year/",
                                        { state: { classes: year.classes } }
                                    )
                                }
                            >
                                <div className="flex flex-col">
                                    <h1 className="text-lg md:text-2xl font-medium">
                                        {academicYearFormatter(
                                            year.academicYearName
                                        )}
                                    </h1>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassesViewByAcademicYear;
