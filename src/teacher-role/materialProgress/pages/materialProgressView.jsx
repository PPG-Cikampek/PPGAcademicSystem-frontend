import { useContext, useEffect, useState } from "react";
import useHttp from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import { getMonday } from "../utils/dateUtils";
import WeekNavigator from "../components/WeekNavigator";
import ProgressList from "../components/ProgressList";

const MaterialProgressView = () => {
    const [progressData, setProgressData] = useState();
    const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchProgresses = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/materialProgress/${
                auth.userId
            }?week=${currentWeek.toISOString()}`;
            console.log(url);
            try {
                const responseData = await sendRequest(url);
                setProgressData(responseData.progresses);
            } catch (err) {
                setProgressData([]);
                // handled by useHttp
            }
        };
        fetchProgresses();
    }, [sendRequest, currentWeek]);

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
        <>
            {error && (
                <div className="m-2">
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}

            <WeekNavigator
                currentWeek={currentWeek}
                onWeekChange={handleWeekChange}
                onDateChange={handleDateChange}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
            />

            <ProgressList progressData={progressData} isLoading={isLoading} />
        </>
    );
};

export default MaterialProgressView;
