import { useState, useEffect, useContext } from "react";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
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
                        iconName: "icon-park-outline:id-card-h",
                    },
                    {
                        label: "Tanggal Lahir",
                        value: formatDate(responseData.student.dateOfBirth),
                        iconName: "material-symbols:date-range-outline",
                    },
                    {
                        label: "Jenis Kelamin",
                        value:
                            responseData.student.gender === "male"
                                ? "Laki-laki"
                                : "Perempuan",
                        iconName: "tabler:gender-bigender",
                    },
                    {
                        label: "Nama Orang Tua/Wali",
                        value: responseData.student.parentName,
                        iconName: "ri:parent-line",
                    },
                    {
                        label: "Nomor WA Orang Tua/Wali",
                        value: responseData.student.parentPhone
                            ? "0" + responseData.student.parentPhone
                            : "kosong",
                        iconName: "lucide:phone",
                    },
                    {
                        label: "Alamat",
                        value: responseData.student.address,
                        iconName: "ph:map-pin-bold",
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
