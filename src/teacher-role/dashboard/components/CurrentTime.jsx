import { useState, useEffect } from 'react';

const CurrentTime = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    };

    return (
        <div className="space-y-1 text-gray-600">
            <div className="font-normal">
                {formatDate(date)}
            </div>
            <div className="">
                {formatTime(date)} WIB
            </div>
        </div>
    );
};

export default CurrentTime;