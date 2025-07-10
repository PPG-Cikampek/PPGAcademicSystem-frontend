import { useState, useEffect } from 'react';
import { Clock, Construction, ArrowRight } from 'lucide-react';
import { formatDate } from '../../shared/Utilities/formatDateToLocal';
import logo from '../../assets/logos/ppgcikampek.webp';

const MaintenanceView = () => {
    // Set your target date here
    const targetDate = new Date('2025-06-09T08:00:00');
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 text-gray-800">
            {/* Main Content Container */}
            <div className="w-full max-w-lg mx-auto mb-12 space-y-8 animate-fade-in">
                {/* Icon Animation */}
                <div className="flex justify-center">
                    <img src={logo} alt="logo" className="size-24 self-center" />
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-center animate-slide-up">
                    Pemutakhiran dan Pembaharuan Website
                </h1>

                {/* Message */}
                <p className="md:text-lg text-base text-center text-gray-600 animate-slide-up">
                    Sistem Akademik PPG Cikampek sedang dalam proses pemeliharan sistem untuk peningkatan pelayanan. Mohon maaf atas ketidaknyamanannya.
                </p>

                <p className="md:text-2xl text-xl text-center text-gray-600 animate-slide-up font-lpmq">
                    الحمد لله جزا كم الله خيرا
                </p>

                {/* Countdown Timer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                    {[
                        { label: 'Hari', value: timeLeft.days },
                        { label: 'Jam', value: timeLeft.hours },
                        { label: 'Menit', value: timeLeft.minutes },
                        { label: 'Detik', value: timeLeft.seconds }
                    ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md animate-pulse">
                            <span className="text-2xl md:text-3xl font-bold text-blue-500">
                                {value}
                            </span>
                            <span className="text-sm text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Expected Return Time */}
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>Estimasi selesai: {formatDate(targetDate, true)} WIB</span>
                </div>
            </div>
        </div>
    );
};

// Add these animations to your global CSS file
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .animate-fade-in {
    animation: fade-in 1s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.8s ease-out;
  }
`;
document.head.appendChild(style);

export default MaintenanceView;