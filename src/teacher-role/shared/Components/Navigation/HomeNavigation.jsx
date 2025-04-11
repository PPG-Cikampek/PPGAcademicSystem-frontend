import React, { useState, useContext } from 'react'

import { AuthContext } from '../../../../shared/Components/Context/auth-context';

import BottomNav from './BottomNav';
import Sidebar from '../../../../shared/Components/Navigation/Sidebar/Sidebar';
import { GraduationCap, Notebook, Users, Presentation, Gauge, CalendarCog, Settings, BookOpenText } from 'lucide-react';


const HomeNavigation = ({ children }) => {

    const auth = useContext(AuthContext);

    const links = auth.userRole === 'teacher' ?
        [
            {
                link: `/dashboard/teachers/${auth.userId}`,
                icon: <GraduationCap />,
                label: auth.userName,
            },
            {
                link: '/attendance/history/',
                icon: <Presentation />,
                label: 'Kelas',
            },
            {
                link: '/journal',
                icon: <Notebook />,
                label: 'Jurnal',
            },
            {
                link: '/dashboard/students',
                icon: <Users />,
                label: 'Peserta Didik',
            },
            {
                link: '/munaqasyah',
                icon: <BookOpenText />,
                label: 'Munaqosah',
            },
            {
                link: '/performances',
                icon: <Gauge />,
                label: 'Performa Kehadiran',
            },
            {
                link: '/dashboard/academic',
                icon: <CalendarCog />,
                label: 'Tahun Ajaran',
            },
            {
                link: `/settings/profile/` + auth.userId,
                icon: <Settings />,
                label: 'Pengaturan Akun',
            },
        ] : auth.userRole === 'student' ?
        [
            {
                link: `/dashboard/students/${auth.userId}`,
                icon: <GraduationCap />,
                label: auth.userName,
            },
        ] : 
        [
            {
                link: `/dashboard/user/${auth.userId}`,
                icon: <GraduationCap />,
                label: auth.userName,
            },
        ]

    return (
        <Sidebar
            linksList={links}
        >
            {children}
            {auth.userRole === 'teacher' && <BottomNav />}
        </Sidebar>

    )
}

export default HomeNavigation