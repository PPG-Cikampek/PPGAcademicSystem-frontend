import { lazy } from "react";
import PreviewReport from "../munaqasyah/pages/PreviewReport";
import SubBranchAdminClassesView from "../class/pages/SubBranchAdminClassesView";
import BranchYearsView from "../academic/pages/BranchYearsView";
import NewBranchYearsView from "../academic/pages/NewBranchYearView";
import NewTeachingGroupView from "../teaching-group/page/NewTeachingGroupView";
import BranchAdminMunaqasyahView from "../munaqasyah/pages/BranchAdminMunaqasyahView";
import TeachingGroupsView from "../teaching-group/page/TeachingGroupsView";
import AddSubBranchToTeachingGroupView from "../teaching-group/page/AddSubBranchToTeachingGroupView";
import BranchAdminMunaqasyahDetailView from "../munaqasyah/pages/BranchAdminMunaqasyahDetailView";

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
const ProfileView = lazy(() => import("../users/pages/ProfileView"));
const EmailVerifyView = lazy(() => import("../users/pages/EmailVerifyView"));
const BranchPerformanceView = lazy(() =>
    import("../performance/pages/BranchPerformanceView")
);
const RequestAccountView = lazy(() =>
    import("../users/pages/RequestAccountView")
);
const RequestAccountForm = lazy(() =>
    import("../users/pages/RequestAccountForm")
);
const RequestAccountTicketDetail = lazy(() =>
    import("../users/pages/RequestAccountTicketDetail")
);

export const branchAdminRoutes = [
    { path: "/verify-email/:token", element: <EmailVerifyView /> },
    { path: "/profile/:userId", element: <ProfileView /> },
    { path: "/dashboard", element: <DashboardView /> },
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
        path: "/dashboard/teaching-groups/:teachingGroupId",
        element: <TeachingGroupsView />,
    },
    {
        path: "/dashboard/teaching-groups/:teachingGroupId/add-class/",
        element: <NewClassView />,
    },
    {
        path: "/dashboard/teaching-groups/:teachingGroupId/add-sub-branches/",
        element: <AddSubBranchToTeachingGroupView />,
    },
    { path: "/munaqasyah/student/score", element: <PreviewReport /> },
    { path: "/academic/", element: <BranchYearsView /> },
    { path: "/academic/new", element: <NewBranchYearsView /> },
    { path: "/academic/teachingGroups/new", element: <NewTeachingGroupView /> },
    { path: "/performance", element: <BranchPerformanceView /> },
    { path: "/settings/requestAccount", element: <RequestAccountView /> },
    {
        path: "/settings/requestAccount/:accountType",
        element: <RequestAccountForm />,
    },
    {
        path: "/settings/requestAccount/ticket/:ticketId",
        element: <RequestAccountTicketDetail />,
    },
    {
        path: "/dashboard/classes/:classId/add-students",
        element: <AddStudentToClassView />,
    },
    {
        path: "/dashboard/classes/:classId/add-teachers",
        element: <AddTeacherToClassView />,
    },
    // { path: '/performance', element: <SubBranchPerformanceView /> },
    { path: "/munaqasyah", element: <BranchAdminMunaqasyahView /> },
    {
        path: "/munaqasyah/:branchYearId",
        element: <BranchAdminMunaqasyahDetailView />,
    },
];

export const BranchAdminRouteWrapper = ({ children }) => (
    <DashboardNav>{children}</DashboardNav>
);
