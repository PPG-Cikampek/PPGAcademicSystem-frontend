import { useState } from "react";

export const useExpandedDates = () => {
    const [expandedDates, setExpandedDates] = useState([]);

    const toggleExpand = (date) => {
        setExpandedDates((prev) =>
            prev.includes(date)
                ? prev.filter((d) => d !== date)
                : [...prev, date]
        );
    };

    const collapseAll = () => {
        setExpandedDates([]);
    };

    return {
        expandedDates,
        toggleExpand,
        collapseAll,
    };
};
