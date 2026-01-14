import { lazy } from "react";

// Lazy load portal pages
const DashboardPortalPage = lazy(() =>
    import("../developer-portal/pages/DashboardPortalPage")
);

const BugBountyPage = lazy(() =>
    import("../developer-portal/pages/BugBountyPage")
);

// Info portal routes accessible to all authenticated users
// All routes now point to the unified dashboard page
export const infoPortalRoutes = [
    { path: "/info-portal", element: <DashboardPortalPage /> },
    { path: "/info-portal/features", element: <DashboardPortalPage /> },
    { path: "/info-portal/releases", element: <DashboardPortalPage /> },
    { path: "/info-portal/announcements", element: <DashboardPortalPage /> },
    // Bug Bounty routes
    { path: "/info-portal/bug-bounty", element: <BugBountyPage /> },
    { path: "/info-portal/bug-bounty/:reportId", element: <BugBountyPage /> },
];
