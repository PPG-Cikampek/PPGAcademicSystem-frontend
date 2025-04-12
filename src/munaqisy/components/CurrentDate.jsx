import { useState, useEffect } from 'react';

const CurrentDate = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const formatDay = (date) => {
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', {
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
        <div className="flex items-center">
            <span className="font-semibold text-xl mr-2">
                {formatDay(date)}
            </span>
            <span className='mr-2'>
                {formatDate(date)}, 
            </span>
            <span className="">
                {formatTime(date)} WIB
            </span>
        </div>
    );
};

export default CurrentDate;