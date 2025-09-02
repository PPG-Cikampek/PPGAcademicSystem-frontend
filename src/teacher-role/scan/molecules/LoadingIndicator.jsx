import React from "react";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";

const LoadingIndicator = ({ size = 32 }) => (
    <div className={`flex justify-center mt-16 `}>
        <LoadingCircle size={size} />
    </div>
);

export default LoadingIndicator;
