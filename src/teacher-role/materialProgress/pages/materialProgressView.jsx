import { useContext, useState } from "react";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import {
    getMonday,
    formatDate,
    formatTime,
} from "../../../shared/Utilities/dateUtils";
import WeekNavigator from "../components/WeekNavigator";
import ProgressList from "../components/ProgressList";
import DataTable from "../../../shared/Components/UIElements/DataTable";
import { Grid3X3, List } from "lucide-react";
import FloatingButton from "../../shared/Components/UIElements/FloatingButton";
import { useMaterialProgress } from "../../../shared/queries";

const MaterialProgressView = () => {
    const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const auth = useContext(AuthContext);
    const [viewMode, setViewMode] = useState("list");

    const {
        data: progressData,
        isLoading,
        error,
    } = useMaterialProgress(auth.userId, currentWeek.toISOString());

    const handleWeekChange = (direction) => {
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() + direction * 7);
        setCurrentWeek(getMonday(newDate));
    };

    const handleDateChange = (event) => {
        setCurrentWeek(getMonday(new Date(event.target.value)));
        setShowDatePicker(false);
    };

    const columns = [
        {
            key: "forDate",
            label: "Tanggal",
            render: (item) => formatDate(item.forDate),
        },
        {
            key: "forTime",
            label: "Waktu",
            render: (item) => formatTime(item.forDate),
        },
        { key: "category", label: "Kategori" },
        { key: "material", label: "Materi" },
    ];

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
                <ProgressList
                    progressData={progressData}
                    isLoading={isLoading}
                />
            ) : (
                <DataTable
                    data={progressData || []}
                    columns={columns}
                    searchableColumns={["category", "material"]}
                    tableId="material-progress"
                    isLoading={isLoading}
                />
            )}
            <div className="fixed bottom-24 right-6 z-50">
                <FloatingButton link={"/materialProgress/new"} />
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
                {viewMode === "table" && (
                    <FloatingButton link="/materialProgress/new" />
                )}
            </div>
        </div>
    );
};

export default MaterialProgressView;
