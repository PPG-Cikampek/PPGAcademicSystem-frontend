import SkeletonLoader from "../../../shared/Components/UIElements/SkeletonLoader";
import InfoCard from "../../shared/Components/UIElements/InfoCard";
import JournalCard from "./JournalCard";

const JournalList = ({ journalData, isLoading }) => {
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

    if (!journalData) return null;

    return (
        <>
            {Array.isArray(journalData) &&
                journalData.length >= 1 &&
                journalData.map((journal) => (
                    <JournalCard key={journal._id} journal={journal} />
                ))}
            {Array.isArray(journalData) && journalData.length === 0 && (
                <InfoCard className="mx-4">
                    <p className="text-gray-500 italic">Tidak ada data</p>
                </InfoCard>
            )}
        </>
    );
};

export default JournalList;
