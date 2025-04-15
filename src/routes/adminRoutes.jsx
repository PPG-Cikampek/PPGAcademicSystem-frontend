import React, { lazy } from 'react';
import PreviewReport from '../munaqasyah/pages/PreviewReport';
import QuestionPackageView from '../munaqasyah/pages/QuestionPackageView';

const DashboardNav = lazy(() => import("../shared/Components/Navigation/DashboardNav/DashboardNav"));
const DashboardView = lazy(() => import("../dashboard/pages/DashboardView"));
const ClassesView = lazy(() => import("../class/pages/ClassesView"));
const StudentsView = lazy(() => import("../students/pages/StudentsView"));
const StudentDetailView = lazy(() => import("../students/pages/StudentDetailView"));
const PerformanceView = lazy(() => import("../performance/pages/PerformanceView"));
const TeachersView = lazy(() => import("../teachers/pages/TeachersView"));
const TeacherDetailView = lazy(() => import("../teachers/pages/TeacherDetailView"));
const UsersView = lazy(() => import("../users/pages/UsersView"));
const NewUserView = lazy(() => import("../users/pages/NewUserView"));
const UpdateUserView = lazy(() => import("../users/pages/UpdateUserView"));
const NewTeacherView = lazy(() => import("../teachers/pages/NewTeacherView"));
const LevelsView = lazy(() => import("../levels/pages/LevelsView"));
const NewLevelView = lazy(() => import("../levels/pages/NewLevelView"));
const AcademicYearsView = lazy(() => import("../academic/pages/AcademicYearsView"));
const NewAcademicYearView = lazy(() => import("../academic/pages/NewAcademicYearView"));
const ClassDetailView = lazy(() => import("../class/pages/ClassDetailView"));
const NewStudentView = lazy(() => import("../students/pages/NewStudentsView"));
const BulkNewUsersAndStudentsView = lazy(() => import("../users/pages/BulkNewUsersAndStudentsView"));
const UpdateStudentView = lazy(() => import("../students/pages/UpdateStudentView"));
const UpdateTeacherView = lazy(() => import("../teachers/pages/UpdateTeacherView"));
const StudentReportView = lazy(() => import("../students/pages/StudentReportView"));
const UpdateTeachingGroupView = lazy(() => import("../levels/pages/UpdateTeachingGroupView"));
const UpdateBranchView = lazy(() => import("../teachers/pages/UpdateBranchView"));
const UpdateAcademicYearView = lazy(() => import("../academic/pages/UpdateAcademicYearView"));
const ProfileView = lazy(() => import("../users/pages/ProfileView"));
const EmailVerifyView = lazy(() => import("../users/pages/EmailVerifyView"));
const RequestAccountTicketDetail = lazy(() => import("../users/pages/RequestAccountTicketDetail"));
const MunaqasyahView = lazy(() => import("../munaqasyah/pages/MunaqasyahView"));
const QuestionBankView = lazy(() => import("../munaqasyah/pages/QuestionBankView"));
const SelectMunaqasyahClassView = lazy(() => import("../munaqasyah/pages/SelectMunaqasyahClassView"));
const NewQuestionView = lazy(() => import("../munaqasyah/pages/NewQuestionView"));
const QuestionDetailView = lazy(() => import("../munaqasyah/pages/QuestionDetailView"));
const RequestedAccountView = lazy(() => import("../users/pages/RequestedAccountView"));
const UpdateQuestionView = lazy(() => import("../munaqasyah/pages/UpdateQuestionView"));

export const adminRoutes = [
    { path: '/verify-email/:token', element: <EmailVerifyView /> },
    { path: '/profile/:userId', element: <ProfileView /> },
    { path: '/dashboard', element: <DashboardView /> },
    { path: '/dashboard/classes', element: <ClassesView /> },
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
    { path: '/profile/:userId', element: <ProfileView /> },
    { path: '/settings/academic', element: <AcademicYearsView /> },
    { path: '/settings/academic/new', element: <NewAcademicYearView /> },
    { path: '/settings/academic/:academicYearId', element: <UpdateAcademicYearView /> },
    { path: '/settings/levels', element: <LevelsView /> },
    { path: '/settings/levels/new', element: <NewLevelView /> },
    { path: '/settings/levels/:branchId', element: <UpdateBranchView /> },
    { path: '/settings/levels/teaching-group/:teachingGroupId', element: <UpdateTeachingGroupView /> },
    { path: '/settings/users', element: <UsersView /> },
    { path: '/settings/users/new', element: <NewUserView /> },
    { path: '/settings/users/:userId', element: <UpdateUserView /> },
    { path: '/settings/users/bulk-create', element: <BulkNewUsersAndStudentsView /> },
    { path: '/settings/requested-accounts', element: <RequestedAccountView /> },
    { path: '/settings/requestAccount/ticket/:ticketId', element: <RequestAccountTicketDetail /> },
    { path: '/performance', element: <PerformanceView /> },
    { path: '/munaqasyah', element: <MunaqasyahView /> },
    { path: '/munaqasyah/question-bank', element: <SelectMunaqasyahClassView /> },
    { path: '/munaqasyah/question-bank/:classGrade', element: <QuestionBankView /> },
    { path: '/munaqasyah/question-bank/:classGrade/new', element: <NewQuestionView /> },
    { path: '/munaqasyah/question-bank/:classGrade/:questionId', element: <QuestionDetailView /> },
    { path: '/munaqasyah/question-bank/:classGrade/:questionId/update', element: <UpdateQuestionView /> },
    { path: '/munaqasyah/question-package', element: <QuestionPackageView/> },
];

export const AdminRouteWrapper = ({ children }) => (
    <DashboardNav>{children}</DashboardNav>
);
