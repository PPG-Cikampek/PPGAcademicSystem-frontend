import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { infoPortalRoutes } from "./infoPortalRoutes";

import { MunaqasyahScoreProvider } from "../munaqisy/context/MunaqasyahScoreContext";
import ProfileView from "../users/pages/profile/ProfileView";
import MunaqasyahScannerView from "../munaqisy/pages/MunaqasyahScannerView";
import StudentScoresView from "../munaqisy/pages/StudentScoresView";
import QuestionView from "../munaqisy/pages/QuestionView";

const PageHeader = lazy(() =>
    import("../teacher-role/shared/Components/Navigation/PageHeader")
);

const HomeScreenView = lazy(() =>
    import("../teacher-role/dashboard/pages/HomeScreenView")
);
const HomeNavigation = lazy(() =>
    import("../teacher-role/shared/Components/Navigation/HomeNavigation")
);

const queryClient = new QueryClient();

export const munaqisyRoutes = [
    { path: "/", element: <HomeScreenView /> },
    {
        path: "/settings/profile/:userId",
        element: (
            <PageHeader>
                <ProfileView />
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
    // Info Portal routes (accessible to all authenticated users)
    ...infoPortalRoutes,
];

export const MunaqisyRouteWrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
        <MunaqasyahScoreProvider>
            <HomeNavigation>{children}</HomeNavigation>
        </MunaqasyahScoreProvider>
    </QueryClientProvider>
);
