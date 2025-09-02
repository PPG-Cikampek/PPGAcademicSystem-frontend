import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "../utils/dateUtils";

const WeekNavigator = ({
    currentWeek,
    onWeekChange,
    onDateChange,
    showDatePicker,
    setShowDatePicker,
}) => {
    const handleWeekChange = (direction) => {
        onWeekChange(direction);
    };

    const handleDateChange = (event) => {
        onDateChange(event);
        setShowDatePicker(false);
    };

    return (
        <div className="flex justify-between items-center m-5 px-6">
            <button onClick={() => handleWeekChange(-1)}>
                <div className="p-2 border-2 rounded-full bg-white active:bg-gray-400">
                    <ChevronLeft size={24} />
                </div>
            </button>
            <div className="relative">
                <button onClick={() => setShowDatePicker(!showDatePicker)}>
                    {formatDate(currentWeek)}
                </button>
                {showDatePicker && (
                    <input
                        type="month"
                        value={currentWeek.toISOString().slice(0, 7)}
                        className="absolute top-full -left-4 mt-1 border rounded-full px-4 py-2"
                        onChange={handleDateChange}
                        onBlur={() => setShowDatePicker(false)}
                    />
                )}
            </div>
            <button onClick={() => handleWeekChange(1)}>
                <div className="p-2 border-2 rounded-full bg-white active:bg-gray-400">
                    <ChevronRight size={24} />
                </div>
            </button>
        </div>
    );
};

export default WeekNavigator;
