import { adminRoutes, AdminRouteWrapper } from "./adminRoutes.jsx";
import {
    curriculumRoutes,
    CurriculumRouteWrapper,
} from "./curriculumRoutes.jsx";
import {
    branchAdminRoutes,
    BranchAdminRouteWrapper,
} from "./branchAdminRoutes.jsx";
import {
    subBranchAdminRoutes,
    SubBranchAdminRouteWrapper,
} from "./subBranchAdminRoutes.jsx";
import { teacherRoutes, TeacherRouteWrapper } from "./teacherRoutes.jsx";
import { munaqisyRoutes, MunaqisyRouteWrapper } from "./munaqisyRoutes.jsx";
import { studentRoutes, StudentRouteWrapper } from "./studentRoutes.jsx";

import AuthView from "../users/pages/auth/AuthView.jsx";
import PasswordResetView from "../users/pages/auth/PasswordResetView.jsx";
import EmailVerifyView from "../users/pages/auth/EmailVerifyView.jsx";
import StudentIDCard from "../students/id-card/StudentIDCard.jsx";

const getRouteConfig = (userRole) => {
    switch (userRole) {
        case "teacher":
            return {
                routes: teacherRoutes,
                Wrapper: TeacherRouteWrapper,
            };
        case "branchAdmin":
            return {
                routes: branchAdminRoutes,
                Wrapper: BranchAdminRouteWrapper,
            };
        case "munaqisy":
            return {
                routes: munaqisyRoutes,
                Wrapper: MunaqisyRouteWrapper,
            };
        case "student":
            return {
                routes: studentRoutes,
                Wrapper: StudentRouteWrapper,
            };
        case "subBranchAdmin":
            return {
                routes: subBranchAdminRoutes,
                Wrapper: SubBranchAdminRouteWrapper,
            };
        case "admin":
            return {
                routes: adminRoutes,
                Wrapper: AdminRouteWrapper,
            };
        case "curriculum":
            return {
                routes: curriculumRoutes,
                Wrapper: CurriculumRouteWrapper,
            };
        default:
            return {
                routes: [
                    { path: "/", element: <AuthView /> },
                    {
                        path: "/reset-password/:token",
                        element: <PasswordResetView />,
                    },
                    {
                        path: "/verify-email/:token",
                        element: <EmailVerifyView />,
                    },
                    {
                        path: "/demo",
                        element: <StudentIDCard />,
                    },
                ],
                Wrapper: ({ children }) => <>{children}</>,
            };
    }
};

export { getRouteConfig };
