import { useMemo, useContext } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { useTeacher } from "../../shared/queries";
import { Icon } from "@iconify-icon/react";
import getTeacherPositionName from "../../shared/Utilities/getTeacherPositionName";

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });
};

const useTeacherData = (teacherId) => {
    const auth = useContext(AuthContext);

    const { data: teacher, isLoading } = useTeacher(
        teacherId,
        auth.userRole,
        auth.userId,
        { enabled: !!(teacherId || (auth.userRole === "teacher" && auth.userId)) }
    );

    const teacherDetails = useMemo(() => {
        if (!teacher) return [];

        return [
            {
                label: "NIG",
                value: teacher.nig,
                icon: (
                    <Icon
                        icon="icon-park-outline:id-card-h"
                        width="24"
                        height="24"
                    />
                ),
            },
            {
                label: "Nomor HP",
                value: teacher.phone,
                icon: <Icon icon="tabler:phone" width="24" height="24" />,
            },
            {
                label: "Tanggal Lahir",
                value: formatDate(teacher.dateOfBirth),
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
                value: teacher.gender
                    ? teacher.gender === "male"
                        ? "Laki-laki"
                        : "Perempuan"
                    : "",
                icon: <Icon icon="tabler:gender-bigender" width="24" height="24" />,
            },
            {
                label: "Domisili",
                value: teacher.address,
                icon: <Icon icon="ph:map-pin-bold" width="24" height="24" />,
            },
            {
                label: "Posisi",
                value: getTeacherPositionName(teacher.position),
                icon: (
                    <Icon
                        icon="material-symbols:category-outline-rounded"
                        width="24"
                        height="24"
                    />
                ),
            },
            {
                label: "Mulai Masa Tugas",
                value: formatDate(teacher.positionStartDate),
                icon: <Icon icon="lucide:briefcase" width="24" height="24" />,
            },
        ];
    }, [teacher]);

    const teacherInfo = useMemo(() => {
        if (!teacher) return null;
        return {
            name: teacher.name,
            nig: teacher.nig,
            image: teacher.image,
            branch: teacher.userId?.subBranchId?.branchId?.name,
            subBranch: teacher.userId?.subBranchId?.name,
        };
    }, [teacher]);

    const teacherData = useMemo(() => {
        if (!teacher) return null;
        return {
            id: teacher._id,
            isProfileComplete: teacher.isProfileComplete,
        };
    }, [teacher]);

    return { isLoading, teacherDetails, teacherInfo, teacherData };
};

export default useTeacherData;
