import { lazy } from "react";

const AdminPortalPage = lazy(() => import("./pages/AdminPortalPage"));
const FeatureManagementPage = lazy(() =>
    import("./pages/FeatureManagementPage")
);
const ReleaseManagementPage = lazy(() =>
    import("./pages/ReleaseManagementPage")
);
const AnnouncementManagementPage = lazy(() =>
    import("./pages/AnnouncementManagementPage")
);

export const adminPortalRoutes = [
    { path: "/admin/portal", element: <AdminPortalPage /> },
    { path: "/admin/portal/features", element: <FeatureManagementPage /> },
    { path: "/admin/portal/features/new", element: <FeatureManagementPage /> },
    {
        path: "/admin/portal/features/:featureId/edit",
        element: <FeatureManagementPage />,
    },
    { path: "/admin/portal/releases", element: <ReleaseManagementPage /> },
    { path: "/admin/portal/releases/new", element: <ReleaseManagementPage /> },
    {
        path: "/admin/portal/releases/:releaseId/edit",
        element: <ReleaseManagementPage />,
    },
    {
        path: "/admin/portal/announcements",
        element: <AnnouncementManagementPage />,
    },
    {
        path: "/admin/portal/announcements/new",
        element: <AnnouncementManagementPage />,
    },
    {
        path: "/admin/portal/announcements/:announcementId/edit",
        element: <AnnouncementManagementPage />,
    },
];
