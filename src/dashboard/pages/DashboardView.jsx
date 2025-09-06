import { useDashboard } from "../../shared/queries";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

import {
    GraduationCap,
    Presentation,
    Users,
    Gauge,
    Layers2,
    Layers,
} from "lucide-react";

const DashboardView = () => {
    const { data: dashboardData, isLoading, error, refetch } = useDashboard();

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="card-interactive m-0 rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 w-full h-full min-h-[120px] overflow-hidden"
                            >
                                <SkeletonLoader
                                    variant="rectangular"
                                    height="120px"
                                />
                            </div>
                        ))}
                    </div>
                )}
                {error && <ErrorCard error={error} onClear={() => refetch()} />}

                {!isLoading && dashboardData && (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                        {dashboardData.dashboardData?.Desa && (
                            <div className="card-interactive m-0 rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 w-full h-full min-h-[120px] overflow-hidden">
                                <Layers className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold truncate">
                                        {dashboardData.dashboardData.Desa}
                                    </h1>
                                    <p className="truncate text-sm">{"Desa"}</p>
                                </div>
                            </div>
                        )}
                        {dashboardData.dashboardData?.Kelompok && (
                            <div className="card-interactive rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 m-0 w-full h-full min-h-[120px] overflow-hidden">
                                <Layers2 className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold truncate">
                                        {dashboardData.dashboardData.Kelompok}
                                    </h1>
                                    <p className="truncate text-sm">
                                        {"Kelompok"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {dashboardData.dashboardData?.kelas && (
                            <div className="card-interactive rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 m-0 w-full h-full min-h-[120px] overflow-hidden">
                                <Presentation className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold truncate">
                                        {dashboardData.dashboardData.kelas}
                                    </h1>
                                    <p className="truncate text-sm">
                                        {"Kelas"}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="card-interactive rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 m-0 w-full h-full min-h-[120px] overflow-hidden">
                            <Users className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold truncate">
                                    {dashboardData.dashboardData?.[
                                        "Peserta Didik"
                                    ] || 0}
                                </h1>
                                <p className="truncate text-sm">
                                    {"Peserta Didik"}
                                </p>
                            </div>
                        </div>
                        <div className="card-interactive rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 m-0 w-full h-full min-h-[120px] overflow-hidden">
                            <GraduationCap className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold truncate">
                                    {dashboardData.dashboardData?.[
                                        "Tenaga Pendidik"
                                    ] || 0}
                                </h1>
                                <p className="truncate text-sm">
                                    {"Tenaga Pendidik"}
                                </p>
                            </div>
                        </div>
                        <div className="card-interactive rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 m-0 w-full h-full min-h-[120px] overflow-hidden">
                            <Gauge className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold truncate">
                                    {dashboardData.dashboardData?.Kehadiran?.[0]?.attendancePercentage
                                        ? `${dashboardData.dashboardData.Kehadiran[0].attendancePercentage.toFixed(
                                              1
                                          )}%`
                                        : "-"}
                                </h1>
                                <p className="truncate text-sm">
                                    {"Kehadiran"}
                                </p>
                            </div>
                        </div>
                        {/* {dashboardData.dashboardData?.Kehadiran?.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="card-interactive rounded-md gap-4 flex items-center justify-start border-0 border-b-4 border-secondary p-4 md:p-6 lg:p-8 m-0 w-full h-full min-h-[120px] overflow-hidden"
                                >
                                    <Gauge className="size-8 md:size-10" />
                                    <div className="flex flex-col">
                                        <h1 className="text-2xl font-bold truncate">
                                            {item.attendancePercentage
                                                ? `${item.attendancePercentage.toFixed(
                                                      1
                                                  )}%`
                                                : "-"}
                                        </h1>
                                        <p className="truncate text-sm">
                                            {`${academicYearFormatter(
                                                item.academicYearName
                                            )}`}
                                        </p>
                                    </div>
                                </div>
                            )
                        )} */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardView;
