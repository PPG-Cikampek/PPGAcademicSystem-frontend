import { lazy } from "react";
import PreviewReport from "../munaqasyah/pages/PreviewReport";
import SubBranchAdminClassesView from "../class/pages/SubBranchAdminClassesView";
import TeachingGroupDetailView from "../teaching-group/page/TeachingGroupDetailView";
import BranchYearsView from "../academic/pages/BranchYearsView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { infoPortalRoutes } from "./infoPortalRoutes";

const DashboardNav = lazy(() =>
    import("../shared/Components/Navigation/DashboardNav/DashboardNav")
);
const DashboardView = lazy(() => import("../dashboard/pages/DashboardView"));
const StudentsView = lazy(() => import("../students/pages/StudentsView"));
const StudentDetailView = lazy(() =>
    import("../students/pages/StudentDetailView")
);
const TeachersView = lazy(() => import("../teachers/pages/TeachersView"));
const TeacherDetailView = lazy(() =>
    import("../teachers/pages/TeacherDetailView")
);
const NewTeacherView = lazy(() => import("../teachers/pages/NewTeacherView"));
const NewClassView = lazy(() => import("../class/pages/NewClassView"));
const ClassDetailView = lazy(() => import("../class/pages/ClassDetailView"));
const NewStudentView = lazy(() => import("../students/pages/NewStudentsView"));
const AddStudentToClassView = lazy(() =>
    import("../class/pages/AddStudentToClassView")
);
const AddTeacherToClassView = lazy(() =>
    import("../class/pages/AddTeacherToClassView")
);
const UpdateStudentView = lazy(() =>
    import("../students/pages/UpdateStudentView")
);
const UpdateTeacherView = lazy(() =>
    import("../teachers/pages/UpdateTeacherView")
);
const StudentReportView = lazy(() =>
    import("../students/pages/StudentReportView")
);
const ProfileView = lazy(() => import("../users/pages/profile/ProfileView"));
const EmailVerifyView = lazy(() => import("../users/pages/auth/EmailVerifyView"));
const SubBranchPerformanceView = lazy(() =>
    import("../performance/pages/SubBranchPerformanceView")
);
const RequestAccountView = lazy(() =>
    import("../users/pages/account-requests/RequestAccountView")
);
const RequestAccountForm = lazy(() =>
    import("../users/pages/account-requests/RequestAccountForm")
);
const RequestAccountTicketDetail = lazy(() =>
    import("../users/pages/account-requests/RequestAccountTicketDetail")
);
const SubBranchMunaqasyahView = lazy(() =>
    import("../munaqasyah/pages/SubBranchMunaqasyahView")
);
const MunaqasyahClassList = lazy(() =>
    import("../munaqasyah/pages/MunaqasyahClassList")
);
const MunaqasyahByClassView = lazy(() =>
    import("../munaqasyah/pages/MunaqasyahByClassView")
);
const HelpCenterView = lazy(() => import("../shared/pages/HelpCenterView"));

export const subBranchAdminRoutes = [
    { path: "/verify-email/:token", element: <EmailVerifyView /> },
    { path: "/profile/:userId", element: <ProfileView /> },
    { path: "/dashboard", element: <DashboardView /> },
    { path: "/help-center", element: <HelpCenterView /> },
    { path: "/dashboard/classes", element: <SubBranchAdminClassesView /> },
    { path: "/dashboard/classes/:classId", element: <ClassDetailView /> },
    { path: "/dashboard/students", element: <StudentsView /> },
    { path: "/dashboard/students/new", element: <NewStudentView /> },
    { path: "/dashboard/students/:studentId", element: <StudentDetailView /> },
    {
        path: "/dashboard/students/:studentId/update",
        element: <UpdateStudentView />,
    },
    { path: "/dashboard/teachers", element: <TeachersView /> },
    { path: "/dashboard/teachers/new", element: <NewTeacherView /> },
    { path: "/dashboard/teachers/:teacherId", element: <TeacherDetailView /> },
    { path: "/dashboard/teachers/:id/update", element: <UpdateTeacherView /> },
    {
        path: "/performances/student/:studentId",
        element: <StudentReportView />,
    },
    { path: "/munaqasyah/student/score", element: <PreviewReport /> },
    { path: "/academic/classes/new", element: <NewClassView /> },
    { path: "/settings/requestAccount", element: <RequestAccountView /> },
    {
        path: "/settings/requestAccount/:accountType",
        element: <RequestAccountForm />,
    },
    {
        path: "/settings/requestAccount/ticket/:ticketId",
        element: <RequestAccountTicketDetail />,
    },
    { path: "/dashboard/teaching-groups", element: <BranchYearsView /> },
    {
        path: "/dashboard/teaching-groups/:teachingGroupId",
        element: <TeachingGroupDetailView />,
    },
    {
        path: "/dashboard/classes/:classId/add-students",
        element: <AddStudentToClassView />,
    },
    {
        path: "/dashboard/classes/:classId/add-teachers",
        element: <AddTeacherToClassView />,
    },
    { path: "/performance", element: <SubBranchPerformanceView /> },
    { path: "/munaqasyah", element: <SubBranchMunaqasyahView /> },
    { path: "/munaqasyah/:branchYearId", element: <MunaqasyahClassList /> },
    {
        path: "/munaqasyah/class/:classId",
        element: (
            <QueryClientProvider client={new QueryClient()}>
                <MunaqasyahByClassView />
            </QueryClientProvider>
        ),
    },
    // Info Portal routes (accessible to all authenticated users)
    ...infoPortalRoutes,
];

export const SubBranchAdminRouteWrapper = ({ children }) => (
    <DashboardNav>{children}</DashboardNav>
);
