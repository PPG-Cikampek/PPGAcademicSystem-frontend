import { useContext } from "react";

import { AuthContext } from "../../Context/auth-context";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../NavBar/Navbar";
import {
    GraduationCap,
    Presentation,
    Users,
    House,
    Gauge,
    UserRoundPlus,
    UserCog,
    Layers2,
    FolderCog,
    CalendarCog,
    BookOpenText,
} from "lucide-react";

const DashboardNav = ({ children }) => {
    const auth = useContext(AuthContext);

    let links = [];

    if (auth.userRole === "admin") {
        links = [
            {
                link: "/dashboard",
                icon: <House />,
                label: "Dashboard",
                end: true,
            },
            {
                link: "/dashboard/classes",
                icon: <Presentation />,
                label: "Kelas",
            },
            {
                link: "/dashboard/teachers",
                icon: <GraduationCap />,
                label: "Tenaga Pendidik",
            },
            {
                link: "/dashboard/students",
                icon: <Users />,
                label: "Peserta Didik",
            },
            {
                link: "/performance",
                icon: <Gauge />,
                label: "Performa Kehadiran",
            },
            {
                link: "/munaqasyah",
                icon: <BookOpenText />,
                label: "Munaqosah",
            },
            {
                link: null,
                icon: <FolderCog />,
                label: "Manajemen",
                end: true,
                subOptions: [
                    {
                        link: "/settings/levels",
                        label: "Desa dan Kelompok",
                        icon: <Layers2 />,
                    },
                    {
                        link: "/academic",
                        label: "Tahun Ajaran",
                        icon: <CalendarCog />,
                    },
                    {
                        link: "/settings/users",
                        label: "User",
                        icon: <UserCog />,
                    },
                    {
                        link: "/settings/requested-accounts",
                        label: "Permintaan Akun",
                        icon: <UserRoundPlus />,
                    },
                    // { link: '/settings/more', label: 'Lainnya', icon: <Settings /> },
                ],
            },
        ];
    } else if (auth.userRole === "branchAdmin") {
        links = [
            {
                link: "/dashboard",
                icon: <House />,
                label: "Dashboard",
                end: true,
            },
            // {
            //     link: '/dashboard/classes',
            //     icon: <Presentation />,
            //     label: 'Kelas',
            // },
            {
                link: "/dashboard/teachers",
                icon: <GraduationCap />,
                label: "Tenaga Pendidik",
            },
            {
                link: "/dashboard/students",
                icon: <Users />,
                label: "Peserta Didik",
            },
            {
                link: "/performance",
                icon: <Gauge />,
                label: "Performa Kehadiran",
            },
            {
                link: null,
                icon: <FolderCog />,
                label: "Manajemen",
                end: true,
                subOptions: [
                    {
                        link: "/academic",
                        label: "Tahun Ajaran Desa",
                        icon: <CalendarCog />,
                    },
                    {
                        link: "/munaqasyah",
                        label: "Munaqosah",
                        icon: <BookOpenText />,
                    },
                ],
            },
        ];
    } else if (auth.userRole === "subBranchAdmin") {
        links = [
            {
                link: "/dashboard",
                icon: <House />,
                label: "Dashboard",
                end: true,
            },
            // {
            //     link: '/dashboard/classes',
            //     icon: <Presentation />,
            //     label: 'Kelas',
            // },
            {
                link: "/dashboard/teachers",
                icon: <GraduationCap />,
                label: "Tenaga Pendidik",
            },
            {
                link: "/dashboard/students",
                icon: <Users />,
                label: "Peserta Didik",
            },
            {
                link: "/performance",
                icon: <Gauge />,
                label: "Performa Kehadiran",
            },
            {
                link: null,
                icon: <FolderCog />,
                label: "Manajemen",
                end: true,
                subOptions: [
                    {
                        link: "/dashboard/teaching-groups",
                        label: "KBM",
                        icon: <CalendarCog />,
                    },
                    {
                        link: "/munaqasyah",
                        label: "Munaqosah",
                        icon: <BookOpenText />,
                    },
                    // { link: '/settings/transfer-students', label: 'Mutasi & Pindah Sambung', icon: <ArrowRightLeft size={24}/> },
                    {
                        link: "/settings/requestAccount",
                        label: "Permintaan Akun",
                        icon: <UserRoundPlus />,
                    },
                    // { link: '/settings/more', label: 'Lainnya', icon: <Settings /> },
                ],
            },
        ];
    } else if (auth.userRole === "curriculum") {
        links = [
            {
                link: "/dashboard",
                icon: <House />,
                label: "Dashboard",
                end: true,
            },
            {
                link: "/munaqasyah",
                icon: <BookOpenText />,
                label: "Munaqosah",
            },
        ];
    }

    return (
        <Sidebar linksList={links}>
            <Navbar />
            {children}
        </Sidebar>
    );
};

export default DashboardNav;
