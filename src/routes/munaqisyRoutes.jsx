import React, { lazy } from 'react';
import { MunaqasyahScoreProvider } from '../munaqisy/context/MunaqasyahScoreContext';

import PageHeader from '../teacher-role/shared/Components/Navigation/PageHeader';
import StudentsView from '../students/pages/StudentsView';
import StudentDetailView from '../students/pages/StudentDetailView';

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