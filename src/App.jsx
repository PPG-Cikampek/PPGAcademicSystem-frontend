import React, { useState, useCallback, useContext, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuth } from "./shared/hooks/auth-hook";
import { AuthContext } from "./shared/Components/Context/auth-context";
import { SidebarContext } from "./shared/Components/Context/sidebar-context";
import { StudentAttendanceProvider } from "./teacher-role/scan/context/StudentAttendanceContext";
import LoadingCircle from "./shared/Components/UIElements/LoadingCircle";
import MunaqasyahScannerView from "./munaqisy/pages/MunaqasyahScannerView";
import StudentScoresView from "./munaqisy/pages/StudentScoresView";
import { MunaqasyahScoreProvider } from "./munaqisy/context/MunaqasyahScoreContext";
import QuestionView from "./munaqisy/pages/QuestionView";
import PreviewReport from "./munaqasyah/pages/PreviewReport";

const DashboardNav = lazy(() => import("./shared/Components/Navigation/DashboardNav/DashboardNav"));
const DashboardView = lazy(() => import("./dashboard/pages/DashboardView"));
const AuthView = lazy(() => import('./users/pages/AuthView'));
const ClassesView = lazy(() => import("./class/pages/ClassesView"));
const StudentsView = lazy(() => import("./students/pages/StudentsView"));
const StudentDetailView = lazy(() => import("./students/pages/StudentDetailView"));
const PerformanceView = lazy(() => import("./performance/pages/PerformanceView"));
const TeachersView = lazy(() => import("./teachers/pages/TeachersView"));
const TeacherDetailView = lazy(() => import("./teachers/pages/TeacherDetailView"));
const HomeScreenView = lazy(() => import("./teacher-role/dashboard/pages/HomeScreenView"));
const HomeNavigation = lazy(() => import("./teacher-role/shared/Components/Navigation/HomeNavigation"));
const ScannerView = lazy(() => import("./teacher-role/scan/pages/ScannerView"));
const JournalView = lazy(() => import("./teacher-role/journal/pages/JournalView"));
const PageHeader = lazy(() => import("./teacher-role/shared/Components/Navigation/PageHeader"));
const AttendanceHistoryView = lazy(() => import("./teacher-role/history/attendanceHistory/pages/AttendanceHistoryView"));
const AttendanceHistoryViewByClass = lazy(() => import("./teacher-role/history/attendanceHistory/pages/AttendanceHistoryViewByClass"));
const UsersView = lazy(() => import("./users/pages/UsersView"));
const NewUserView = lazy(() => import("./users/pages/NewUserView"));
const UpdateUserView = lazy(() => import("./users/pages/UpdateUserView"));
const NewTeacherView = lazy(() => import("./teachers/pages/NewTeacherView"));
const LevelsView = lazy(() => import("./levels/pages/LevelsView"));
const NewLevelView = lazy(() => import("./levels/pages/NewLevelView"));
const AcademicYearsView = lazy(() => import("./academic/pages/AcademicYearsView"));
const TeachingGroupYearsView = lazy(() => import("./academic/pages/TeachingGroupYearsView"));
const NewAcademicYearView = lazy(() => import("./academic/pages/NewAcademicYearView"));
const NewClassView = lazy(() => import("./class/pages/NewClassView"));
const NewTeachingGroupYearView = lazy(() => import("./academic/pages/NewTeachingGroupYearView"));
const ClassDetailView = lazy(() => import("./class/pages/ClassDetailView"));
const NewStudentView = lazy(() => import("./students/pages/NewStudentsView"));
const BulkNewUsersAndStudentsView = lazy(() => import("./users/pages/BulkNewUsersAndStudentsView"));
const AddStudentToClassView = lazy(() => import("./class/pages/AddStudentToClassView"));
const AddTeacherToClassView = lazy(() => import("./class/pages/AddTeacherToClassView"));
const UpdateStudentView = lazy(() => import("./students/pages/UpdateStudentView"));
const UpdateTeacherView = lazy(() => import("./teachers/pages/UpdateTeacherView"));
const SelectClassView = lazy(() => import("./teacher-role/scan/pages/SelectClassView"));
const EditAttendanceConfirmation = lazy(() => import("./teacher-role/history/attendanceHistory/pages/EditAttendanceConfirmation"));
const UpdateAttendanceView = lazy(() => import("./teacher-role/history/attendanceHistory/pages/UpdateAttendanceView"));
const UpdateTeachingGroupYearsView = lazy(() => import("./academic/pages/UpdateTeachingGroupYearsView"));
const UpdateLevelView = lazy(() => import("./levels/pages/UpdateLevelView"));
const StudentReportView = lazy(() => import("./students/pages/StudentReportView"));
const UpdateTeachingGroupView = lazy(() => import("./levels/pages/UpdateTeachingGroupView"));
const UpdateBranchView = lazy(() => import("./teachers/pages/UpdateBranchView"));
const UpdateAcademicYearView = lazy(() => import("./academic/pages/UpdateAcademicYearView"));
const ProfileView = lazy(() => import("./users/pages/ProfileView"));
const PasswordResetView = lazy(() => import("./users/pages/PasswordResetView"));
const EmailVerifyView = lazy(() => import("./users/pages/EmailVerifyView"));
const NewJournalView = lazy(() => import("./teacher-role/journal/pages/NewJournalView"));
const TeachingGroupPerformanceView = lazy(() => import("./performance/pages/TeachingGroupPerformanceView"));
const TeacherPerformanceView = lazy(() => import("./performance/pages/TeacherPerformanceView"));
const MaterialProgressView = lazy(() => import("./teacher-role/materialProgress/pages/materialProgressView"));
const NewMaterialProgresslView = lazy(() => import("./teacher-role/materialProgress/pages/NewMaterialProgressView"));
const RequestAccountView = lazy(() => import("./users/pages/RequestAccountView"));
const RequestAccountForm = lazy(() => import("./users/pages/RequestAccountForm"));
const RequestAccountTicketDetail = lazy(() => import("./users/pages/RequestAccountTicketDetail"));
const StudentDashboardView = lazy(() => import("./students/pages/StudentDashboardView"));
const MunaqasyahView = lazy(() => import("./munaqasyah/pages/MunaqasyahView"));
const QuestionBankView = lazy(() => import("./munaqasyah/pages/QuestionBankView"));
const SelectMunaqasyahClassView = lazy(() => import("./munaqasyah/pages/SelectMunaqasyahClassView"));
const NewQuestionView = lazy(() => import("./munaqasyah/pages/NewQuestionView"));
const QuestionDetailView = lazy(() => import("./munaqasyah/pages/QuestionDetailView"));
const RequestedAccountView = lazy(() => import("./users/pages/RequestedAccountView"));
const UpdateQuestionView = lazy(() => import("./munaqasyah/pages/UpdateQuestionView"));
const TeachingGroupMunaqasyahView = lazy(() => import("./munaqasyah/pages/TeachingGroupMunaqasyahView"));
const MunaqasyahClassList = lazy(() => import("./munaqasyah/components/MunaqasyahClassList"));
const MunaqasyahByClassView = lazy(() => import("./munaqasyah/pages/MunaqasyahByClassView"));

function App() {
  const queryClient = new QueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { token, login, logout, userId, userRole, userName, userBranchId, userTeachingGroupId, currentTeachingGroupYear, currentTeachingGroupYearId, userClassIds, setAttributes } = useAuth();


  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize); // Add resize listener

    return () => {
      window.removeEventListener('resize', checkScreenSize); // Cleanup on unmount
    };
  }, []);

  const toggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  })

  let routes;
  if (token && userRole === 'teacher') {
    routes = (
      <QueryClientProvider client={queryClient}>
        <StudentAttendanceProvider>
          <MunaqasyahScoreProvider>
            <HomeNavigation>
              <Routes>
                <Route path='/' element={<HomeScreenView />} />
                <Route path='/scan' element={<ScannerView />} />
                <Route path='/scan/select-class' element={<SelectClassView />} />
                <Route path='/profile/:userId' element={
                  <PageHeader>
                    <ProfileView />
                  </PageHeader>
                } />
                <Route path='/attendance/history/' element=
                  {
                    <PageHeader>
                      <AttendanceHistoryView />
                    </PageHeader>
                  } />
                <Route path='/scan/class/:classId' element={<ScannerView />} />
                <Route path='/attendance/history/class/:classId' element=
                  {
                    <PageHeader>
                      <AttendanceHistoryViewByClass />
                    </PageHeader>
                  } />
                <Route path='/attendance/history/class/:classId/:attendancId' element=
                  {
                    <PageHeader>
                      <AttendanceHistoryViewByClass />
                    </PageHeader>
                  } />
                <Route path='/attendance/history/class/:classId/:attendanceId/edit' element=
                  {
                    <PageHeader>
                      <UpdateAttendanceView />
                    </PageHeader>
                  } />
                <Route path='/materialProgress' element=
                  {
                    <PageHeader>
                      <MaterialProgressView />
                    </PageHeader>
                  } />
                <Route path='/materialProgress/new' element=
                  {
                    <PageHeader>
                      <NewMaterialProgresslView />
                    </PageHeader>
                  } />
                <Route path='/journal' element=
                  {
                    <PageHeader>
                      <JournalView />
                    </PageHeader>
                  } />
                <Route path='/journal/new' element=
                  {
                    <PageHeader>
                      <NewJournalView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/teachers/:teacherId' element=
                  {
                    <PageHeader>
                      <TeacherDetailView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/teachers/:id/update' element=
                  {
                    <PageHeader>
                      <UpdateTeacherView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/students' element=
                  {
                    <PageHeader>
                      <StudentsView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/students/:studentId' element=
                  {
                    <PageHeader>
                      <StudentDetailView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/students/:studentId/update' element=
                  {
                    <PageHeader>
                      <UpdateStudentView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/academic' element=
                  {
                    <PageHeader>
                      <TeachingGroupYearsView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/classes/:classId' element=
                  {
                    <PageHeader>
                      <ClassDetailView />
                    </PageHeader>
                  } />
                <Route path='/dashboard/classes/:classId/add-students' element=
                  {
                    <PageHeader>
                      <AddStudentToClassView />
                    </PageHeader>
                  } />
                <Route path='/munaqasyah/scanner' element=
                  {
                    <PageHeader>
                      <MunaqasyahScannerView />
                    </PageHeader>
                  } />
                <Route path='/munaqasyah/student' element=
                  {
                    <PageHeader>
                      <StudentScoresView />
                    </PageHeader>
                  } />
                  <Route path='/munaqasyah/examination' element=
                  {
                    <PageHeader>
                      <QuestionView />
                    </PageHeader>
                  } />
                <Route path='/settings/academic/classes/new' element=
                  {
                    <PageHeader>
                      <NewClassView />
                    </PageHeader>
                  } />
                <Route path='/performances' element=
                  {
                    <PageHeader>
                      <Suspense
                        fallback={
                          <div className="flex justify-center mt-16">
                            <LoadingCircle size={32} />
                          </div>
                        }>
                        <TeacherPerformanceView />
                      </Suspense>
                    </PageHeader>
                  } />
                <Route path='/performances/student/:studentId' element=
                  {
                    <PageHeader>
                      <StudentReportView />
                    </PageHeader>
                  } />
                <Route path='/settings/profile/:userId' element=
                  {
                    <PageHeader>
                      <ProfileView />
                    </PageHeader>
                  } />
                <Route path='/verify-email/:token' element={<EmailVerifyView />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </HomeNavigation>
          </MunaqasyahScoreProvider>
        </StudentAttendanceProvider>
      </QueryClientProvider>
    )
  } else if (token && userRole === 'munaqisy') {
    routes = (
      <MunaqasyahScoreProvider>
        <HomeNavigation>
          <Routes>
            <Route path='/dashboard/students' element=
              {
                <PageHeader>
                  <StudentsView />
                </PageHeader>
              } />
            <Route path='/dashboard/students/:studentId' element=
              {
                <PageHeader>
                  <StudentDetailView />
                </PageHeader>
              } />
          </Routes>
        </HomeNavigation>
      </MunaqasyahScoreProvider>
    )
  } else if (token && userRole === 'student') {
    routes = (
      <HomeNavigation >
        <Routes>
          <Route path='/' element={
            <PageHeader>
              <StudentDashboardView />
            </PageHeader>
          } />
          <Route path='/dashboard/students/:studentId' element=
            {
              <PageHeader>
                <StudentDetailView />
              </PageHeader>
            } />
          <Route path='/dashboard/students/:studentId/update' element=
            {
              <PageHeader>
                <UpdateStudentView />
              </PageHeader>
            } />
          <Route path='/settings/profile/:userId' element=
            {
              <PageHeader>
                <ProfileView />
              </PageHeader>
            } />
          <Route path='/verify-email/:token' element={<EmailVerifyView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HomeNavigation>
    )
  } else if (token && userRole === 'admin' || userRole === 'admin kelompok') {
    routes = (
      <DashboardNav>
        {/* <div className="max-w-7xl mx-auto"> */}
        <Routes>
          <Route path='/verify-email/:token' element={<EmailVerifyView />} />
          <Route path='/profile/:userId' element={<ProfileView />} />
          <Route path='/dashboard' element={<DashboardView />} />
          <Route path='/dashboard/classes' element={<ClassesView />} />
          <Route path='/dashboard/classes/:classId' element={<ClassDetailView />} />
          <Route path='/dashboard/students' element={<StudentsView />} />
          <Route path='/dashboard/students/new' element={<NewStudentView />} />
          <Route path='/dashboard/students/:studentId' element={<StudentDetailView />} />
          <Route path='/dashboard/students/:studentId/update' element={<UpdateStudentView />} />
          <Route path='/dashboard/teachers' element={<TeachersView />} />
          <Route path='/dashboard/teachers/new' element={<NewTeacherView />} />
          <Route path='/dashboard/teachers/:teacherId' element={<TeacherDetailView />} />
          <Route path='/dashboard/teachers/:id/update' element={<UpdateTeacherView />} />
          <Route path='/performances/student/:studentId' element={<StudentReportView />} />
          <Route path='/munaqasyah/student/score' element={<PreviewReport />} />
          {userRole === 'admin kelompok' && (
            <>
              <Route path='/settings/academic' element={<TeachingGroupYearsView />} />
              <Route path='/settings/academic/new' element={<NewTeachingGroupYearView />} />
              <Route path='/settings/academic/:teachingGroupYearId' element={<UpdateTeachingGroupYearsView />} />
              <Route path='/settings/academic/classes/new' element={<NewClassView />} />
              <Route path='/settings/requestAccount' element={<RequestAccountView />} />
              <Route path='/settings/requestAccount/:accountType' element={<RequestAccountForm />} />
              <Route path='/settings/requestAccount/ticket/:ticketId' element={<RequestAccountTicketDetail />} />
              <Route path='/dashboard/classes/:classId/add-students' element={<AddStudentToClassView />} />
              <Route path='/dashboard/classes/:classId/add-teachers' element={<AddTeacherToClassView />} />
              <Route path='/performance' element={<TeachingGroupPerformanceView />} />
              <Route path='/munaqasyah' element={<TeachingGroupMunaqasyahView />} />
              <Route path='/munaqasyah/:teachingGroupYearId' element={<MunaqasyahClassList />} />
              <Route path='/munaqasyah/class/:classId' element={<MunaqasyahByClassView />} />
            </>
          )}
          {userRole === 'admin' && (
            <>
              <Route path='/profile/:userId' element={<ProfileView />} />
              <Route path='/settings/academic' element={<AcademicYearsView />} />
              <Route path='/settings/academic/new' element={<NewAcademicYearView />} />
              <Route path='/settings/academic/:academicYearId' element={<UpdateAcademicYearView />} />
              <Route path='/settings/levels' element={<LevelsView />} />
              <Route path='/settings/levels/new' element={<NewLevelView />} />
              <Route path='/settings/levels/:branchId' element={<UpdateBranchView />} />
              <Route path='/settings/levels/teaching-group/:teachingGroupId' element={<UpdateTeachingGroupView />} />
              <Route path='/settings/users' element={<UsersView />} />
              <Route path='/settings/users/new' element={<NewUserView />} />
              <Route path='/settings/users/:userId' element={<UpdateUserView />} />
              <Route path='/settings/users/bulk-create' element={<BulkNewUsersAndStudentsView />} />
              <Route path='/settings/requested-accounts' element={<RequestedAccountView />} />
              <Route path='/settings/requestAccount/ticket/:ticketId' element={<RequestAccountTicketDetail />} />
              <Route path='/performance' element={<PerformanceView />} />
              <Route path='/munaqasyah' element={<MunaqasyahView />} />
              <Route path='/munaqasyah/question-bank' element={<SelectMunaqasyahClassView />} />
              <Route path='/munaqasyah/question-bank/:classGrade' element={<QuestionBankView />} />
              <Route path='/munaqasyah/question-bank/:classGrade/new' element={<NewQuestionView />} />
              <Route path='/munaqasyah/question-bank/:classGrade/:questionId' element={<QuestionDetailView />} />
              <Route path='/munaqasyah/question-bank/:classGrade/:questionId/update' element={<UpdateQuestionView />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        {/* </div> */}
      </DashboardNav>
    )
  } else {
    routes = (
      <Routes>
        <Route path='/' element={<AuthView />} />
        <Route path='/reset-password/:token' element={<PasswordResetView />} />
        <Route path='/verify-email/:token' element={<EmailVerifyView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  return (
    <SidebarContext.Provider value={{ isSidebarOpen: isSidebarOpen, toggle: toggle }}>
      <AuthContext.Provider value={{ isLoggedIn: !!token, userRole, userId, userName, userBranchId, userTeachingGroupId, currentTeachingGroupYear, currentTeachingGroupYearId, userClassIds, token, login, setAttributes, logout }}>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <main className="h-auto">
            <Suspense
              fallback={
                <div className="flex justify-center mt-16">
                  <LoadingCircle size={32} />
                </div>
              }>
              {routes}
            </Suspense>
          </main>
        </Router>
      </AuthContext.Provider>
    </SidebarContext.Provider>
  )
}

export default App
