import { NavLink, Navigate } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import {
    useAnnouncements,
    useCurrentFeatures,
    useReleaseNotes,
} from "../hooks/usePortalData";
import { useAdminCheck } from "../hooks/useAdminCheck";
import "../styles/admin-portal.css";

const summaryCards = [
    {
        title: "Kelola Fitur",
        description: "Tambah, perbarui, dan tandai status pengembangan fitur.",
        link: "/admin/portal/features",
    },
    {
        title: "Kelola Catatan Rilis",
        description: "Catat setiap versi dan sorotan perubahan aplikasi.",
        link: "/admin/portal/releases",
    },
    {
        title: "Kelola Pengumuman",
        description: "Komunikasikan informasi penting ke seluruh pengguna.",
        link: "/admin/portal/announcements",
    },
];

const StatsCard = ({ label, value, link }) => (
    <NavLink
        to={link}
        className="flex flex-col gap-4 bg-white shadow-sm p-6 border border-gray-200 rounded-lg admin-portal-card"
    >
        <div>
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="font-semibold text-gray-900 text-3xl">{value}</p>
        </div>
        <span className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
            Lihat detail →
        </span>
    </NavLink>
);

const AdminPortalPage = () => {
    const { isAdmin, userRole } = useAdminCheck();
    const featuresQuery = useCurrentFeatures();
    const releasesQuery = useReleaseNotes();
    const announcementsQuery = useAnnouncements();

    if (userRole && !isAdmin) {
        return <Navigate to="/info-portal" replace />;
    }

    const isLoading =
        featuresQuery.isLoading ||
        releasesQuery.isLoading ||
        announcementsQuery.isLoading;

    const hasError =
        featuresQuery.error || releasesQuery.error || announcementsQuery.error;

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen admin-portal-container">
            <div className="flex flex-col gap-8 mx-auto max-w-6xl">
                <PortalHeader
                    title="Manajemen Portal Pengembang"
                    description="Kelola fitur, catatan rilis, dan pengumuman yang muncul di portal informasi pengguna."
                />

                {isLoading && (
                    <div className="flex justify-center py-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {hasError && (
                    <div className="gap-4 grid md:grid-cols-2">
                        {featuresQuery.error && (
                            <ErrorCard
                                error={featuresQuery.error}
                                onClear={featuresQuery.refetch}
                            />
                        )}
                        {releasesQuery.error && (
                            <ErrorCard
                                error={releasesQuery.error}
                                onClear={releasesQuery.refetch}
                            />
                        )}
                        {announcementsQuery.error && (
                            <ErrorCard
                                error={announcementsQuery.error}
                                onClear={announcementsQuery.refetch}
                            />
                        )}
                    </div>
                )}

                {!isLoading && !hasError && (
                    <>
                        <section className="gap-4 grid md:grid-cols-3">
                            <StatsCard
                                label="Total Fitur"
                                value={featuresQuery.data?.length || 0}
                                link="/admin/portal/features"
                            />
                            <StatsCard
                                label="Catatan Rilis"
                                value={releasesQuery.data?.length || 0}
                                link="/admin/portal/releases"
                            />
                            <StatsCard
                                label="Pengumuman Aktif"
                                value={announcementsQuery.data?.length || 0}
                                link="/admin/portal/announcements"
                            />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPortalPage;
