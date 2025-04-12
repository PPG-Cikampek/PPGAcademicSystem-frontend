import React from 'react';
import { useLocation } from 'react-router-dom';

const StudentScoresView = () => {
    const location = useLocation();
    const scannedData = location.state?.scannedData;
    
    return (
        <div>
            <h1>Verification Page</h1>
            <p>Scanned Data: {scannedData}</p>
        </div>
    );
};

export default StudentScoresView;