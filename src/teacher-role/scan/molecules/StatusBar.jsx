import React, { useContext } from "react";
import CurrentDate from "../atoms/CurrentDate";
import ScanCounter from "../atoms/ScanCounter";

const StatusBar = () => {
    return (
        <div className="card-basic mx-4 mb-0 justify-between items-center">
            <CurrentDate />
            <ScanCounter />
        </div>
    );
};

export default StatusBar;
