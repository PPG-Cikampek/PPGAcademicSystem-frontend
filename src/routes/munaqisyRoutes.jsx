import React, { lazy } from 'react';
import { MunaqasyahScoreProvider } from '../munaqisy/context/MunaqasyahScoreContext';

const PageHeader = lazy(() => import('../teacher-role/shared/Components/Navigation/PageHeader'));
const StudentsView = lazy(() => import('../students/pages/StudentsView'));
const StudentDetailView = lazy(() => import('../students/pages/StudentDetailView'));

const HomeScreenView = lazy(() => import('../teacher-role/dashboard/pages/HomeScreenView'));
const HomeNavigation = lazy(() => import('../teacher-role/shared/Components/Navigation/HomeNavigation'));

export const munaqisyRoutes = [
    { path: '/', element: <HomeScreenView /> },
    {
        path: '/dashboard/students',
        element:
            (
                <PageHeader>
                    <StudentsView />
                </PageHeader>
            )
    },
    {
        path: '/dashboard/students/:studentId',
        element:
            (
                <PageHeader>
                    <StudentDetailView />
                </PageHeader>
            )
    }
]


export const MunaqisyRouteWrapper = ({ children }) => (
    <MunaqasyahScoreProvider>
        <HomeNavigation>
            {children}
        </HomeNavigation>
    </MunaqasyahScoreProvider>
);