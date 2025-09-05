import { useState, useEffect, useContext } from "react";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { Icon } from "@iconify-icon/react";
import { formatDate } from "../utilities/studentUtils";

const useStudentData = (studentId) => {
    const { isLoading, sendRequest } = useHttp();
    const [studentDetails, setStudentDetails] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchStudentData = async () => {
            const url =
                auth.userRole === "student"
                    ? `${import.meta.env.VITE_BACKEND_URL}/students/user/${
                          auth.userId
                      }`
                    : studentId
                    ? `${
                          import.meta.env.VITE_BACKEND_URL
                      }/students/${studentId}`
                    : "";

            try {
                const responseData = await sendRequest(url);

                setStudentDetails([
                    {
                        label: "NIS",
                        value: responseData.student.nis,
                        icon: (
                            <Icon
                                icon="icon-park-outline:id-card-h"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Tanggal Lahir",
                        value: formatDate(responseData.student.dateOfBirth),
                        icon: (
                            <Icon
                                icon="material-symbols:date-range-outline"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Jenis Kelamin",
                        value:
                            responseData.student.gender === "male"
                                ? "Laki-laki"
                                : "Perempuan",
                        icon: (
                            <Icon
                                icon="tabler:gender-bigender"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Nama Orang Tua/Wali",
                        value: responseData.student.parentName,
                        icon: (
                            <Icon
                                icon="ri:parent-line"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Nomor WA Orang Tua/Wali",
                        value: responseData.student.parentPhone
                            ? "0" + responseData.student.parentPhone
                            : "kosong",
                        icon: (
                            <Icon icon="lucide:phone" width="24" height="24" />
                        ),
                    },
                    {
                        label: "Alamat",
                        value: responseData.student.address,
                        icon: (
                            <Icon
                                icon="ph:map-pin-bold"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                ]);

                setStudentInfo({
                    name: responseData.student.name,
                    nis: responseData.student.nis,
                    image: responseData.student.image,
                    branch: responseData.student.userId.subBranchId.branchId
                        .name,
                    subBranch: responseData.student.userId.subBranchId.name,
                });

                setStudentData({
                    id: responseData.student._id,
                    isProfileComplete: responseData.student.isProfileComplete,
                });

                console.log({
                    id: responseData.student._id,
                    isProfileComplete: responseData.student.isProfileComplete,
                });
                console.log(auth.userRole);
            } catch (err) {}
        };
        fetchStudentData();
    }, [sendRequest, auth.userRole, auth.userId, studentId]);

    return { isLoading, studentDetails, studentInfo, studentData };
};

export default useStudentData;
