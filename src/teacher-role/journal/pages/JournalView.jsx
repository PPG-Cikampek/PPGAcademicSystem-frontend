import { useContext, useState } from "react";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import {
    getMonday,
    formatDate,
    formatTime,
} from "../../../shared/Utilities/dateUtils";
import DataTable from "../../../shared/Components/UIElements/DataTable";
import { Grid3X3, List } from "lucide-react";
import WeekNavigator from "../components/WeekNavigator";
import JournalList from "../components/JournalList";
import FloatingButton from "../../shared/Components/UIElements/FloatingButton";
import { useJournal } from "../../../shared/queries";

const JournalView = () => {
    const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()));
    const [showDatePicker, setShowDatePicker] = useState(false);

    const auth = useContext(AuthContext);
    const [viewMode, setViewMode] = useState("list");

    const {
        data: journalData,
        isLoading,
        error,
    } = useJournal(auth.userId, currentWeek.toISOString());

    const columns = [
        {
            key: "createdAt",
            label: "Tanggal",
            render: (item) => formatDate(item.createdAt),
        },
        {
            key: "createdAt",
            label: "Waktu",
            render: (item) => formatTime(item.createdAt),
        },
        { key: "title", label: "Judul" },
        { key: "content", label: "Konten" },
    ];

    const handleWeekChange = (direction) => {
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() + direction * 7);
        setCurrentWeek(getMonday(newDate));
    };

    const handleDateChange = (event) => {
        setCurrentWeek(getMonday(new Date(event.target.value)));
        setShowDatePicker(false);
    };

    return (
        <div className="mx-4">
            {error && (
                <div className="m-2">
                    <ErrorCard error={error} />
                </div>
            )}

            <WeekNavigator
                currentWeek={currentWeek}
                onWeekChange={handleWeekChange}
                onDateChange={handleDateChange}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
            />

            {viewMode === "list" ? (
                <JournalList journalData={journalData} isLoading={isLoading} />
            ) : (
                <DataTable
                    data={journalData || []}
                    columns={columns}
                    searchableColumns={["title", "content"]}
                    tableId="journal"
                    isLoading={isLoading}
                />
            )}

            <div className="fixed bottom-24 right-6 z-50">
                <FloatingButton link={"/journal/new"} />
            </div>

            <div className="fixed bottom-25 right-24 z-50 flex flex-col gap-2">
                <button
                    onClick={() =>
                        setViewMode(viewMode === "list" ? "table" : "list")
                    }
                    className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition"
                >
                    {viewMode === "list" ? (
                        <Grid3X3 size={20} />
                    ) : (
                        <List size={20} />
                    )}
                </button>
                {viewMode === "table" && <FloatingButton link="/journal/new" />}
            </div>
        </div>
    );
};

export default JournalView;
