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
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <main className="mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Dashboard
                    </h1>
                </div>

                {isLoading && (
                    <div className="gap-6 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive"
                            >
                                <SkeletonLoader
                                    variant="rectangular"
                                    width={42}
                                    height={42}
                                />
                                <div className="flex flex-col gap-2 w-full">
                                    <SkeletonLoader
                                        variant="rectangular"
                                        width="60%"
                                        height={32}
                                    />
                                    <SkeletonLoader
                                        variant="rectangular"
                                        width="60%"
                                        height={18}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {error && <ErrorCard error={error} onClear={() => refetch()} />}

                {!isLoading && dashboardData && (
                    <div className="gap-6 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
                        {dashboardData.dashboardData?.Desa && (
                            <div className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive">
                                <Layers className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="font-bold text-2xl truncate">
                                        {dashboardData.dashboardData.Desa}
                                    </h1>
                                    <p className="text-sm truncate">{"Desa"}</p>
                                </div>
                            </div>
                        )}
                        {dashboardData.dashboardData?.Kelompok && (
                            <div className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive">
                                <Layers2 className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="font-bold text-2xl truncate">
                                        {dashboardData.dashboardData.Kelompok}
                                    </h1>
                                    <p className="text-sm truncate">
                                        {"Kelompok"}
                                    </p>
                                </div>
                            </div>
                        )}
                        {dashboardData.dashboardData?.kelas && (
                            <div className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive">
                                <Presentation className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="font-bold text-2xl truncate">
                                        {dashboardData.dashboardData.kelas}
                                    </h1>
                                    <p className="text-sm truncate">
                                        {"Kelas"}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive">
                            <Users className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="font-bold text-2xl truncate">
                                    {dashboardData.dashboardData?.[
                                        "Peserta Didik"
                                    ] || 0}
                                </h1>
                                <p className="text-sm truncate">
                                    {"Peserta Didik"}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive">
                            <GraduationCap className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="font-bold text-2xl truncate">
                                    {dashboardData.dashboardData?.[
                                        "Tenaga Pendidik"
                                    ] || 0}
                                </h1>
                                <p className="text-sm truncate">
                                    {"Tenaga Pendidik"}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive">
                            <Gauge className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="font-bold text-2xl truncate">
                                    {dashboardData.dashboardData?.Kehadiran?.[0]?.attendancePercentage
                                        ? `${dashboardData.dashboardData.Kehadiran[0].attendancePercentage.toFixed(
                                              1
                                          )}%`
                                        : "-"}
                                </h1>
                                <p className="text-sm truncate">
                                    {"Kehadiran"}
                                </p>
                            </div>
                        </div>
                        {/* {dashboardData.dashboardData?.Kehadiran?.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-start items-center gap-4 m-0 p-4 md:p-6 lg:p-8 border-0 border-secondary border-b-4 rounded-md w-full h-full min-h-[120px] overflow-hidden card-interactive"
                                >
                                    <Gauge className="size-8 md:size-10" />
                                    <div className="flex flex-col">
                                        <h1 className="font-bold text-2xl truncate">
                                            {item.attendancePercentage
                                                ? `${item.attendancePercentage.toFixed(
                                                      1
                                                  )}%`
                                                : "-"}
                                        </h1>
                                        <p className="text-sm truncate">
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
