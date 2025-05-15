import React, { lazy } from 'react';
import PreviewReport from '../munaqasyah/pages/PreviewReport';
import TeachingGroupAdminClassesView from '../class/pages/TeachingGroupAdminClassesView';

const DashboardNav = lazy(() => import("../shared/Components/Navigation/DashboardNav/DashboardNav"));
const DashboardView = lazy(() => import("../dashboard/pages/DashboardView"));
const StudentsView = lazy(() => import("../students/pages/StudentsView"));
const StudentDetailView = lazy(() => import("../students/pages/StudentDetailView"));
const TeachersView = lazy(() => import("../teachers/pages/TeachersView"));
const TeacherDetailView = lazy(() => import("../teachers/pages/TeacherDetailView"));
const NewTeacherView = lazy(() => import("../teachers/pages/NewTeacherView"));
const TeachingGroupYearsView = lazy(() => import("../academic/pages/TeachingGroupYearsView"));
const NewClassView = lazy(() => import("../class/pages/NewClassView"));
const NewTeachingGroupYearView = lazy(() => import("../academic/pages/NewTeachingGroupYearView"));
const ClassDetailView = lazy(() => import("../class/pages/ClassDetailView"));
const NewStudentView = lazy(() => import("../students/pages/NewStudentsView"));
const AddStudentToClassView = lazy(() => import("../class/pages/AddStudentToClassView"));
const AddTeacherToClassView = lazy(() => import("../class/pages/AddTeacherToClassView"));
const UpdateStudentView = lazy(() => import("../students/pages/UpdateStudentView"));
const UpdateTeacherView = lazy(() => import("../teachers/pages/UpdateTeacherView"));
const UpdateTeachingGroupYearsView = lazy(() => import("../academic/pages/UpdateTeachingGroupYearsView"));
const StudentReportView = lazy(() => import("../students/pages/StudentReportView"));
const ProfileView = lazy(() => import("../users/pages/ProfileView"));
const EmailVerifyView = lazy(() => import("../users/pages/EmailVerifyView"));
const TeachingGroupPerformanceView = lazy(() => import("../performance/pages/TeachingGroupPerformanceView"));
const RequestAccountView = lazy(() => import("../users/pages/RequestAccountView"));
const RequestAccountForm = lazy(() => import("../users/pages/RequestAccountForm"));
const RequestAccountTicketDetail = lazy(() => import("../users/pages/RequestAccountTicketDetail"));
const TeachingGroupMunaqasyahView = lazy(() => import("../munaqasyah/pages/TeachingGroupMunaqasyahView"));
const MunaqasyahClassList = lazy(() => import("../munaqasyah/components/MunaqasyahClassList"));
const MunaqasyahByClassView = lazy(() => import("../munaqasyah/pages/MunaqasyahByClassView"));

export const teachingGroupAdminRoutes = [
    { path: '/verify-email/:token', element: <EmailVerifyView /> },
    { path: '/profile/:userId', element: <ProfileView /> },
    { path: '/dashboard', element: <DashboardView /> },
    { path: '/dashboard/classes', element: <TeachingGroupAdminClassesView /> },
    { path: '/dashboard/classes/:classId', element: <ClassDetailView /> },
    { path: '/dashboard/students', element: <StudentsView /> },
    { path: '/dashboard/students/new', element: <NewStudentView /> },
    { path: '/dashboard/students/:studentId', element: <StudentDetailView /> },
    { path: '/dashboard/students/:studentId/update', element: <UpdateStudentView /> },
    { path: '/dashboard/teachers', element: <TeachersView /> },
    { path: '/dashboard/teachers/new', element: <NewTeacherView /> },
    { path: '/dashboard/teachers/:teacherId', element: <TeacherDetailView /> },
    { path: '/dashboard/teachers/:id/update', element: <UpdateTeacherView /> },
    { path: '/performances/student/:studentId', element: <StudentReportView /> },
    { path: '/munaqasyah/student/score', element: <PreviewReport /> },
    { path: '/settings/academic', element: <TeachingGroupYearsView /> },
    { path: '/settings/academic/new', element: <NewTeachingGroupYearView /> },
    { path: '/settings/academic/:teachingGroupYearId', element: <UpdateTeachingGroupYearsView /> },
    { path: '/settings/academic/classes/new', element: <NewClassView /> },
    { path: '/settings/requestAccount', element: <RequestAccountView /> },
    { path: '/settings/requestAccount/:accountType', element: <RequestAccountForm /> },
    { path: '/settings/requestAccount/ticket/:ticketId', element: <RequestAccountTicketDetail /> },
    { path: '/dashboard/classes/:classId/add-students', element: <AddStudentToClassView /> },
    { path: '/dashboard/classes/:classId/add-teachers', element: <AddTeacherToClassView /> },
    { path: '/performance', element: <TeachingGroupPerformanceView /> },
    { path: '/munaqasyah', element: <TeachingGroupMunaqasyahView /> },
    { path: '/munaqasyah/:teachingGroupYearId', element: <MunaqasyahClassList /> },
    { path: '/munaqasyah/class/:classId', element: <MunaqasyahByClassView /> },
];

export const TeachingGroupAdminRouteWrapper = ({ children }) => (
    <DashboardNav>{children}</DashboardNav>
);
