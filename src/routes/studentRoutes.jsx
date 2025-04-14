import React, { lazy } from 'react';
import PageHeader from '../teacher-role/shared/Components/Navigation/PageHeader';
import HomeNavigation from '../teacher-role/shared/Components/Navigation/HomeNavigation';
import StudentDashboardView from '../students/pages/StudentDashboardView';
import StudentDetailView from '../students/pages/StudentDetailView';
import UpdateStudentView from '../students/pages/UpdateStudentView';
import ProfileView from '../users/pages/ProfileView';

export const studentRoutes = [
    {
        path: '/',
        element: (
            <PageHeader>
                <StudentDashboardView />
            </PageHeader>
        )
    },
    {
        path: '/dashboard/students/:studentId',
        element: (
            <PageHeader>
                <StudentDetailView />
            </PageHeader >
        )
    },
    {
        path: '/dashboard/students/:studentId/update',
        element: (
            < PageHeader >
                <UpdateStudentView />
            </PageHeader >
        )
    },
    {
        path: '/settings/profile/:userId',
        element: (
            < PageHeader >
                <ProfileView/>
            </PageHeader >
        )
    },
]

export const StudentRouteWrapper = ({ children }) => (
    <HomeNavigation>
        {children}
    </HomeNavigation>
);