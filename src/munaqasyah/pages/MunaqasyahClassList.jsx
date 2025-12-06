import { useContext, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const MunaqasyahClassList = () => {
    const [classes, setClasses] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();

    const { branchYearId, subBranchId: paramSubBranchId } = useParams();
    const auth = useContext(AuthContext);
    const subBranchId = paramSubBranchId || auth.userSubBranchId;

    const location = useLocation();
    const subBranchMunaqasyahStatus = location.state?.subBranchMunaqasyahStatus;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/scores/sub-branch/${subBranchId}`,
                    "GET",
                    null,
                    {
                        Authorization: `Bearer ${auth.token}`,
                        "Content-Type": "application/json",
                    }
                );
                setClasses(responseData.classes);
                console.log(responseData);
                // console.log(JSON.stringify(responseData.classes))
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchClasses();
    }, [sendRequest, subBranchId, auth.token]);

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Daftar Kelas
                    </h1>
                </div>

                {(!classes || isLoading) && (
                    <div className="space-y-4">
                        <SkeletonLoader
                            variant="rectangular"
                            width="100%"
                            height={70}
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} />}

                {classes &&
                    !isLoading &&
                    classes.map((cls) => (
                        <div key={cls.classId._id}>
                            <Link
                                to={
                                    paramSubBranchId
                                        ? `/munaqasyah/${branchYearId}/sub-branch/${subBranchId}/class/${cls.classId._id}`
                                        : `/munaqasyah/class/${cls.classId._id}`
                                }
                                state={{
                                    branchYearId,
                                    subBranchId,
                                    subBranchMunaqasyahStatus,
                                }}
                            >
                                <div
                                    className={`card-basic hover:bg-gray-100 active:bg-gray-100 hover:cursor-pointer rounded-md justify-start m-0 transition-all duration-200 my-4`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 h-fit">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-gray-900 text-lg">
                                                    {cls.classId.name}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default MunaqasyahClassList;
