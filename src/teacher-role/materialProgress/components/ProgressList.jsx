import SkeletonLoader from "../../../shared/Components/UIElements/SkeletonLoader";
import InfoCard from "../../shared/Components/UIElements/InfoCard";
import ProgressCard from "./ProgressCard";
import FloatingButton from "../../shared/Components/UIElements/FloatingButton";

const ProgressList = ({ progressData, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 mt-16 mx-4">
                <SkeletonLoader
                    variant="rectangular"
                    height="120px"
                    className="rounded-lg"
                    count={3}
                />
            </div>
        );
    }

    if (!progressData) return null;

    return (
        <>
            {Array.isArray(progressData) &&
                progressData.length >= 1 &&
                progressData.map((progress) => (
                    <ProgressCard
                        key={progress.id || progress.forDate}
                        progress={progress}
                    />
                ))}
            {Array.isArray(progressData) && progressData.length === 0 && (
                <InfoCard className="mx-4">
                    <p className="text-gray-500 italic">Tidak ada data</p>
                </InfoCard>
            )}
        </>
    );
};

export default ProgressList;
