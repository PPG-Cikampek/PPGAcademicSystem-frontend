import { teacherRoutes, TeacherRouteWrapper } from './teacherRoutes.jsx';
import { adminRoutes, AdminRouteWrapper } from './adminRoutes.jsx';
import { munaqisyRoutes, MunaqisyRouteWrapper } from './munaqisyRoutes.jsx';
import { studentRoutes, StudentRouteWrapper } from './studentRoutes.jsx';
import { teachingGroupAdminRoutes, TeachingGroupAdminRouteWrapper } from './teachingGroupAdminRoutes.jsx';
import { curriculumRoutes, CurriculumRouteWrapper } from './curriculumRoutes.jsx';

import AuthView from '../users/pages/AuthView.jsx';
import PasswordResetView from '../users/pages/PasswordResetView.jsx';
import EmailVerifyView from '../users/pages/EmailVerifyView.jsx';

const getRouteConfig = (userRole) => {
    switch (userRole) {
        case 'teacher':
            return {
                routes: teacherRoutes,
                Wrapper: TeacherRouteWrapper
            };
        case 'munaqisy':
            return {
                routes: munaqisyRoutes,
                Wrapper: MunaqisyRouteWrapper
            };
        case 'student':
            return {
                routes: studentRoutes,
                Wrapper: StudentRouteWrapper
            };
        case 'admin kelompok':
            return {
                routes: teachingGroupAdminRoutes,
                Wrapper: TeachingGroupAdminRouteWrapper
            };
        case 'admin':
            return {
                routes: adminRoutes,
                Wrapper: AdminRouteWrapper
            };
        case 'curriculum':
            return {
                routes: curriculumRoutes,
                Wrapper: CurriculumRouteWrapper
            };
        default:
            return {
                routes: [
                    { path: '/', element: <AuthView /> },
                    { path: '/reset-password/:token', element: <PasswordResetView /> },
                    { path: '/verify-email/:token', element: <EmailVerifyView /> }
                ],
                Wrapper: ({ children }) => <>{children}</>
            };
    }
};

export { getRouteConfig };
