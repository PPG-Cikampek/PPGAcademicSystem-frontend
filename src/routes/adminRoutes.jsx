import { lazy } from 'react';
import PreviewReport from '../munaqasyah/pages/PreviewReport';
import ClassesViewByAcademicYear from '../class/pages/ClassesViewByAcademicYear';
import { infoPortalRoutes } from './infoPortalRoutes';

const DashboardNav = lazy(() => import("../shared/Components/Navigation/DashboardNav/DashboardNav"));
const DashboardView = lazy(() => import("../dashboard/pages/DashboardView"));
const ClassesView = lazy(() => import("../class/pages/ClassesView"));
const StudentsView = lazy(() => import("../students/pages/StudentsView"));
const StudentDetailView = lazy(() => import("../students/pages/StudentDetailView"));
const PerformanceView = lazy(() => import("../performance/pages/PerformanceView"));
const TeachersView = lazy(() => import("../teachers/pages/TeachersView"));
const TeacherDetailView = lazy(() => import("../teachers/pages/TeacherDetailView"));
const UsersView = lazy(() => import("../users/pages/user-management/UsersView"));
const NewUserView = lazy(() => import("../users/pages/user-management/NewUserView"));
const UpdateUserView = lazy(() => import("../users/pages/user-management/UpdateUserView"));
const NewTeacherView = lazy(() => import("../teachers/pages/NewTeacherView"));
const LevelsView = lazy(() => import("../levels/pages/LevelsView"));
const NewLevelView = lazy(() => import("../levels/pages/NewLevelView"));
const AcademicYearsView = lazy(() => import("../academic/pages/AcademicYearsView"));
const NewAcademicYearView = lazy(() => import("../academic/pages/NewAcademicYearView"));
const ClassDetailView = lazy(() => import("../class/pages/ClassDetailView"));
const NewStudentView = lazy(() => import("../students/pages/NewStudentsView"));
const BulkNewUsersAndStudentsView = lazy(() => import("../users/pages/user-management/BulkNewUsersAndStudentsView"));
const UpdateStudentView = lazy(() => import("../students/pages/UpdateStudentView"));
const UpdateTeacherView = lazy(() => import("../teachers/pages/UpdateTeacherView"));
const StudentReportView = lazy(() => import("../students/pages/StudentReportView"));
const UpdateSubBranchView = lazy(() => import("../levels/pages/UpdateSubBranchView"));
const UpdateBranchView = lazy(() => import("../levels/pages/UpdateBranchView"));
const UpdateAcademicYearView = lazy(() => import("../academic/pages/UpdateAcademicYearView"));
const ProfileView = lazy(() => import("../users/pages/profile/ProfileView"));
const EmailVerifyView = lazy(() => import("../users/pages/auth/EmailVerifyView"));
const RequestAccountTicketDetail = lazy(() => import("../users/pages/account-requests/RequestAccountTicketDetail"));
const MunaqasyahView = lazy(() => import("../munaqasyah/pages/MunaqasyahView"));
const QuestionBankView = lazy(() => import("../munaqasyah/pages/QuestionBankView"));
const SelectMunaqasyahClassView = lazy(() => import("../munaqasyah/pages/SelectMunaqasyahClassView"));
const NewQuestionView = lazy(() => import("../munaqasyah/pages/NewQuestionView"));
const QuestionDetailView = lazy(() => import("../munaqasyah/pages/QuestionDetailView"));
const RequestedAccountView = lazy(() => import("../users/pages/account-requests/RequestedAccountView"));
const UpdateQuestionView = lazy(() => import("../munaqasyah/pages/UpdateQuestionView"));
const QuestionPackageView = lazy(() => import('../munaqasyah/pages/QuestionPackageView'));
const CategoryPackageView = lazy(() => import('../munaqasyah/pages/CategoryPackageView'));

export const adminRoutes = [
    { path: '/verify-email/:token', element: <EmailVerifyView /> },
    { path: '/profile/:userId', element: <ProfileView /> },
    { path: '/dashboard', element: <DashboardView /> },
    { path: '/dashboard/classes', element: <ClassesViewByAcademicYear/> },
    { path: '/dashboard/classes/academic-year', element: <ClassesView /> },
    { path: '/dashboard/classes/academic-year/:classId', element: <ClassDetailView /> },
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
    { path: '/academic', element: <AcademicYearsView /> },
    { path: '/academic/new', element: <NewAcademicYearView /> },
    { path: '/academic/:academicYearId', element: <UpdateAcademicYearView /> },
    { path: '/settings/levels', element: <LevelsView /> },
    { path: '/settings/levels/new', element: <NewLevelView /> },
    { path: '/settings/levels/:branchId', element: <UpdateBranchView /> },
    { path: '/settings/levels/teaching-group/:subBranchId', element: <UpdateSubBranchView /> },
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
    { path: '/munaqasyah/question-package/class', element: <CategoryPackageView/> },
    // Info Portal routes (accessible to all authenticated users)
    ...infoPortalRoutes,
];

export const AdminRouteWrapper = ({ children }) => (
    <DashboardNav>{children}</DashboardNav>
);
