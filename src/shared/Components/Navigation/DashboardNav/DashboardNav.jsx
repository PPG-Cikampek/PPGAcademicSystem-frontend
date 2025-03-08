import React, { useContext } from 'react';

import { AuthContext } from '../../Context/auth-context';

import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../NavBar/Navbar';
import { GraduationCap, Presentation, Users, House, Gauge, UserRoundPlus, UserCog, Layers2, FolderCog, CalendarCog, BookOpenText } from 'lucide-react';

const DashboardNav = ({ children }) => {
    const auth = useContext(AuthContext)

    let links = []


    if (auth.userRole === 'admin') {
        links = [
            {
                link: '/dashboard',
                icon: <House />,
                label: 'Dashboard',
                end: true,
            },
            {
                link: '/dashboard/classes',
                icon: <Presentation />,
                label: 'Kelas',
            },
            {
                link: '/dashboard/teachers',
                icon: <GraduationCap />,
                label: 'Tenaga Pendidik',
            },
            {
                link: '/dashboard/students',
                icon: <Users />,
                label: 'Peserta Didik',
            },
            {
                link: '/performance',
                icon: <Gauge />,
                label: 'Performa Kehadiran',
            },
            {
                link: '/munaqasyah',
                icon: <BookOpenText />,
                label: 'Munaqasyah',
            },
            {
                link: null,
                icon: <FolderCog />,
                label: 'Manajemen',
                end: true,
                subOptions: [
                    { link: '/settings/levels', label: 'Desa dan Kelompok', icon: <Layers2 /> },
                    { link: '/settings/academic', label: 'Tahun Ajaran', icon: <CalendarCog /> },
                    { link: '/settings/users', label: 'User', icon: <UserCog /> },
                    // { link: '/settings/more', label: 'Lainnya', icon: <Settings /> },
                ],
            },

        ];
    } else {
        links = [
            {
                link: '/dashboard',
                icon: <House />,
                label: 'Dashboard',
                end: true,
            },
            {
                link: '/dashboard/classes',
                icon: <Presentation />,
                label: 'Kelas',
            },
            {
                link: '/dashboard/teachers',
                icon: <GraduationCap />,
                label: 'Tenaga Pendidik',
            },
            {
                link: '/dashboard/students',
                icon: <Users />,
                label: 'Peserta Didik',
            },
            {
                link: '/performance',
                icon: <Gauge />,
                label: 'Performa Kehadiran',
            },
            {
                link: null,
                icon: <FolderCog />,
                label: 'Manajemen',
                end: true,
                subOptions: [
                    { link: '/settings/academic', label: 'Tahun Ajaran Kelompok', icon: <CalendarCog /> },
                    // { link: '/settings/transfer-students', label: 'Mutasi & Pindah Sambung', icon: <ArrowRightLeft size={24}/> },
                    { link: '/settings/requestAccount', label: 'Permintaan Akun', icon: <UserRoundPlus /> },
                    // { link: '/settings/more', label: 'Lainnya', icon: <Settings /> },
                ],
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
