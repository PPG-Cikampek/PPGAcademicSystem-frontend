import React, { lazy } from 'react';

const DashboardNav = lazy(() => import("../shared/Components/Navigation/DashboardNav/DashboardNav"));
const DashboardView = lazy(() => import("../dashboard/pages/DashboardView"));
const ProfileView = lazy(() => import("../users/pages/ProfileView"));
const EmailVerifyView = lazy(() => import("../users/pages/EmailVerifyView"));
const MunaqasyahView = lazy(() => import("../munaqasyah/pages/MunaqasyahView"));
const QuestionBankView = lazy(() => import("../munaqasyah/pages/QuestionBankView"));
const SelectMunaqasyahClassView = lazy(() => import("../munaqasyah/pages/SelectMunaqasyahClassView"));
const NewQuestionView = lazy(() => import("../munaqasyah/pages/NewQuestionView"));
const QuestionDetailView = lazy(() => import("../munaqasyah/pages/QuestionDetailView"));
const UpdateQuestionView = lazy(() => import("../munaqasyah/pages/UpdateQuestionView"));

export const curriculumRoutes = [
    { path: '/verify-email/:token', element: <EmailVerifyView /> },
    { path: '/profile/:userId', element: <ProfileView /> },
    { path: '/dashboard', element: <DashboardView /> },
    { path: '/munaqasyah', element: <MunaqasyahView /> },
    { path: '/munaqasyah/question-bank', element: <SelectMunaqasyahClassView /> },
    { path: '/munaqasyah/question-bank/:classGrade', element: <QuestionBankView /> },
    { path: '/munaqasyah/question-bank/:classGrade/new', element: <NewQuestionView /> },
    { path: '/munaqasyah/question-bank/:classGrade/:questionId', element: <QuestionDetailView /> },
    { path: '/munaqasyah/question-bank/:classGrade/:questionId/update', element: <UpdateQuestionView /> },
]


export const CurriculumRouteWrapper = ({ children }) => (
    <DashboardNav>{children}</DashboardNav>
)