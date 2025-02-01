import React from 'react'
import { NavLink } from 'react-router-dom';
import { Home, BookOpenText } from 'lucide-react';
import { Icon } from '@iconify-icon/react'


const BottomNav = () => {

    const navLinks = [
        { id: 1, label: 'Home', path: '/', icon: <Home size={24} />, end: true },
        { id: 2, label: 'Absen', path: '/scan', icon: <Icon icon="uil:qrcode-scan" width="24" height="24" />, },
        { id: 3, label: 'Materi', path: '/materialProgress', icon: <BookOpenText size={24} /> },
    ];

    return (
        <div className="bg-white border-t border-gray-200 flex flex-grow justify-around items-center h-16 fixed bottom-0 w-full transition-all duration-300">
            {navLinks.map((link, index) => (
                <button key={index} className='basis-16'>
                    <NavLink
                        to={link.path}
                        end={link.end}
                        className={({ isActive }) => `
                                        flex flex-col items-center hover:bg-gray-100 
                                        focus:outline-none focus:ring-primary-subtle 
                                        rounded-3xl pt-1 transition-all duration-300
                                        ${isActive ? 'bg-gray-100 text-primary' : 'text-gray-800'} 
                                    `}
                    >
                        {link.icon}
                        <span className="text-xs mt-1">{link.label}</span>
                    </NavLink>
                </button>
            ))}
        </div>
    )
}

export default BottomNav;