import React, { lazy } from 'react';

const PageHeader = lazy(() => import('../teacher-role/shared/Components/Navigation/PageHeader'));
const HomeNavigation = lazy(() => import('../teacher-role/shared/Components/Navigation/HomeNavigation'));
const StudentDashboardView = lazy(() => import('../students/pages/StudentDashboardView'));
const StudentDetailView = lazy(() => import('../students/pages/StudentDetailView'));
const UpdateStudentView = lazy(() => import('../students/pages/UpdateStudentView'));
const ProfileView = lazy(() => import('../users/pages/ProfileView'));

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