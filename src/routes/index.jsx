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

import AuthView from "../users/pages/AuthView.jsx";
import PasswordResetView from "../users/pages/PasswordResetView.jsx";
import EmailVerifyView from "../users/pages/EmailVerifyView.jsx";
import { Navigate } from "react-router-dom";

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
                ],
                Wrapper: ({ children }) => <>{children}</>,
            };
    }
};

export { getRouteConfig };
