import PortalHeader from "../components/PortalHeader";
import FeatureCard from "../components/FeatureCard";
import ReleaseCard from "../components/ReleaseCard";
import AnnouncementCard from "../components/AnnouncementCard";
import EmptyState from "../components/EmptyState";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useCurrentFeatures, useReleaseNotes, useAnnouncements } from "../hooks/usePortalData";

const DashboardPortalPage = () => {
    const { data: features, isLoading: featuresLoading, error: featuresError, refetch: refetchFeatures } = useCurrentFeatures();
    const { data: releases, isLoading: releasesLoading, error: releasesError, refetch: refetchReleases } = useReleaseNotes();
    const { data: announcements, isLoading: announcementsLoading, error: announcementsError, refetch: refetchAnnouncements } = useAnnouncements();

    const isAnyLoading = featuresLoading || releasesLoading || announcementsLoading;

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-7xl">
                <PortalHeader
                    title="Portal Informasi"
                    description="Informasi real-time tentang pengembangan aplikasi."
                />

                {isAnyLoading && (
                    <div className="flex justify-center py-12">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {!isAnyLoading && (
                    <div className="gap-6 grid lg:grid-cols-3">
                        {/* Mobile-first: Announcements on top. On large screens, make it the right column */}
                        <div className="lg:order-last lg:col-span-1">
                            <div className="top-8 sticky announcements-sidebar">
                                <h2 className="mb-4 font-semibold text-gray-900 text-2xl">
                                    Informasi Umum
                                </h2>
                                {announcementsError && <ErrorCard error={announcementsError} onClear={refetchAnnouncements} />}
                                {!announcementsError && announcements && announcements.length === 0 && (
                                    <EmptyState message="Tidak ada pengumuman tersedia." />
                                )}
                                {!announcementsError && announcements && announcements.length > 0 && (
                                    <div className="space-y-3">
                                        {announcements.slice(0, 5).map((announcement) => (
                                            <AnnouncementCard
                                                key={announcement.id}
                                                announcement={announcement}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Left Section - Features and Release Notes */}
                        <div className="space-y-6 lg:order-first lg:col-span-2">
                            {/* Current Features Section */}
                            <div>
                                <h2 className="mb-4 font-semibold text-gray-900 text-2xl">
                                    Rencana
                                </h2>
                                {featuresError && <ErrorCard error={featuresError} onClear={refetchFeatures} />}
                                {!featuresError && features && features.length === 0 && (
                                    <EmptyState message="No features to display at this time." />
                                )}
                                {!featuresError && features && features.length > 0 && (
                                    <div className="flex-col gap-4 rounded-md card-basic">
                                        {features.map((feature) => (
                                            <FeatureCard key={feature.id} feature={feature} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Release Notes Section */}
                            <div>
                                <h2 className="mb-4 font-semibold text-gray-900 text-2xl">
                                    Riwayat
                                </h2>
                                {releasesError && <ErrorCard error={releasesError} onClear={refetchReleases} />}
                                {!releasesError && releases && releases.length === 0 && (
                                    <EmptyState message="Tidak ada catatan rilis tersedia." />
                                )}
                                {!releasesError && releases && releases.length > 0 && (
                                    <div className="space-y-4">
                                        {releases.slice(0, 5).map((release) => (
                                            <ReleaseCard key={release.version} release={release} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPortalPage;
