import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentAttendanceProvider } from "../teacher-role/scan/context/StudentAttendanceContext";
import { MunaqasyahScoreProvider } from "../munaqisy/context/MunaqasyahScoreContext";
import StudentReportView from "../students/pages/StudentReportView";

const MunaqasyahScannerView = lazy(() =>
    import("../munaqisy/pages/MunaqasyahScannerView")
);
const StudentScoresView = lazy(() =>
    import("../munaqisy/pages/StudentScoresView")
);
const QuestionView = lazy(() => import("../munaqisy/pages/QuestionView"));

const StudentsView = lazy(() => import("../students/pages/StudentsView"));
const StudentDetailView = lazy(() =>
    import("../students/pages/StudentDetailView")
);
const TeacherDetailView = lazy(() =>
    import("../teachers/pages/TeacherDetailView")
);
const HomeScreenView = lazy(() =>
    import("../teacher-role/dashboard/pages/HomeScreenView")
);
const HomeNavigation = lazy(() =>
    import("../teacher-role/shared/Components/Navigation/HomeNavigation")
);
const ScannerView = lazy(() =>
    import("../teacher-role/scan/pages/ScannerView")
);
const JournalView = lazy(() =>
    import("../teacher-role/journal/pages/JournalView")
);
const PageHeader = lazy(() =>
    import("../teacher-role/shared/Components/Navigation/PageHeader")
);
const AttendanceHistoryView = lazy(() =>
    import(
        "../teacher-role/history/attendanceHistory/pages/AttendanceHistoryView"
    )
);
const AttendanceHistoryViewByClass = lazy(() =>
    import(
        "../teacher-role/history/attendanceHistory/pages/AttendanceHistoryViewByClass"
    )
);
const BranchYearsView = lazy(() => import("../academic/pages/BranchYearsView"));
const NewClassView = lazy(() => import("../class/pages/NewClassView"));
const ClassDetailView = lazy(() => import("../class/pages/ClassDetailView"));
const AddStudentToClassView = lazy(() =>
    import("../class/pages/AddStudentToClassView")
);
const UpdateStudentView = lazy(() =>
    import("../students/pages/UpdateStudentView")
);
const UpdateTeacherView = lazy(() =>
    import("../teachers/pages/UpdateTeacherView")
);
const SelectClassView = lazy(() =>
    import("../teacher-role/scan/pages/SelectClassView")
);
const UpdateAttendanceView = lazy(() =>
    import(
        "../teacher-role/history/attendanceHistory/pages/UpdateAttendanceView"
    )
);
// const StudentReportView = lazy(() => import("../students/pages/StudentReportView"));
const ProfileView = lazy(() => import("../users/pages/ProfileView"));
const NewJournalView = lazy(() =>
    import("../teacher-role/journal/pages/NewJournalView")
);
const TeacherPerformanceView = lazy(() =>
    import("../performance/pages/TeacherPerformanceView")
);
const MaterialProgressView = lazy(() =>
    import("../teacher-role/materialProgress/pages/materialProgressView")
);
const NewMaterialProgresslView = lazy(() =>
    import("../teacher-role/materialProgress/pages/NewMaterialProgressView")
);

export const teacherRoutes = [
    { path: "/dashboard", element: <HomeScreenView /> },
    { path: "/scan", element: <ScannerView /> },
    { path: "/scan/select-class", element: <SelectClassView /> },
    {
        path: "/profile/:userId",
        element: (
            <PageHeader>
                <ProfileView />
            </PageHeader>
        ),
    },
    {
        path: "/attendance/history/",
        element: (
            <PageHeader>
                <AttendanceHistoryView />
            </PageHeader>
        ),
    },
    {
        path: "/scan/class/:classId",
        element: (
            <PageHeader>
                <ScannerView />
            </PageHeader>
        ),
    },
    {
        path: "/attendance/history/class/:classId",
        element: (
            <PageHeader>
                <AttendanceHistoryViewByClass />
            </PageHeader>
        ),
    },
    {
        path: "/attendance/history/class/:classId/:attendancId",
        element: (
            <PageHeader>
                <AttendanceHistoryViewByClass />
            </PageHeader>
        ),
    },
    {
        path: "/attendance/history/class/:classId/:attendanceId/edit",
        element: (
            <PageHeader>
                <UpdateAttendanceView />
            </PageHeader>
        ),
    },
    {
        path: "/materialProgress",
        element: (
            <PageHeader>
                <MaterialProgressView />
            </PageHeader>
        ),
    },
    {
        path: "/materialProgress/new",
        element: (
            <PageHeader>
                <NewMaterialProgresslView />
            </PageHeader>
        ),
    },
    {
        path: "/journal",
        element: (
            <PageHeader>
                <JournalView />
            </PageHeader>
        ),
    },
    {
        path: "/journal/new",
        element: (
            <PageHeader>
                <NewJournalView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/teachers/:teacherId",
        element: (
            <PageHeader>
                <TeacherDetailView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/teachers/:id/update",
        element: (
            <PageHeader>
                <UpdateTeacherView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/students",
        element: (
            <PageHeader>
                <StudentsView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/students/:studentId",
        element: (
            <PageHeader>
                <StudentDetailView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/students/:studentId/update",
        element: (
            <PageHeader>
                <UpdateStudentView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/academic",
        element: (
            <PageHeader>
                <BranchYearsView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/classes/:classId",
        element: (
            <PageHeader>
                <ClassDetailView />
            </PageHeader>
        ),
    },
    {
        path: "/dashboard/classes/:classId/add-students",
        element: (
            <PageHeader>
                <AddStudentToClassView />
            </PageHeader>
        ),
    },
    {
        path: "/munaqasyah/scanner",
        element: <MunaqasyahScannerView />,
    },
    {
        path: "/munaqasyah/student",
        element: <StudentScoresView />,
    },
    {
        path: "/munaqasyah/examination",
        element: (
            <PageHeader>
                <QuestionView />
            </PageHeader>
        ),
    },
    {
        path: "/academic/classes/new",
        element: (
            <PageHeader>
                <NewClassView />
            </PageHeader>
        ),
    },
    {
        path: "/performances",
        element: (
            <PageHeader>
                <TeacherPerformanceView />
            </PageHeader>
        ),
    },
    {
        path: "/performances/student",
        element: (
            <PageHeader>
                <StudentReportView />
            </PageHeader>
        ),
    },
    {
        path: "/settings/profile/:userId",
        element: (
            <PageHeader>
                <ProfileView />
            </PageHeader>
        ),
    },
];

export const TeacherRouteWrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
        <StudentAttendanceProvider>
            <MunaqasyahScoreProvider>
                <HomeNavigation>{children}</HomeNavigation>
            </MunaqasyahScoreProvider>
        </StudentAttendanceProvider>
    </QueryClientProvider>
);
