import React, { useState, useContext } from 'react'

import { AuthContext } from '../../../../shared/Components/Context/auth-context';

import BottomNav from './BottomNav';
import Sidebar from '../../../../shared/Components/Navigation/Sidebar/Sidebar';
import { GraduationCap, Notebook, Users, Presentation, Gauge, CalendarCog, Settings } from 'lucide-react';


const HomeNavigation = ({ children }) => {

    const auth = useContext(AuthContext);

    // console.log(auth.userId)
    // console.log(auth.userName)
    // console.log(auth.userRole)
    // console.log(auth.userTeachingGroupId)
    // console.log(auth.currentTeachingGroupYear || 'no active year')
    // console.log(auth.userClassIds || 'no classes')

    const links = [
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
            link: '/performances',
            icon: <Gauge />,
            label: 'Performa Kehadiran',
        },
        // {
        //     link: `/profile/${auth.userId}`,
        //     icon: <Settings />,
        //     label: 'Pengaturan',
        // },
        {
            link: '/dashboard/academic',
            icon: <CalendarCog />,
            label: 'Tahun Ajaran',
        },
    ];

    return (
        <Sidebar
            linksList={links}
        >
            {children}
            <BottomNav />
        </Sidebar>

    )
}

export default HomeNavigation