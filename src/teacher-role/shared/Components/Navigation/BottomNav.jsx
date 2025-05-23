import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Icon } from '@iconify-icon/react'
import { GeneralContext } from '../../../../shared/Components/Context/general-context';
import { AuthContext } from '../../../../shared/Components/Context/auth-context';


const BottomNav = () => {
    const general = useContext(GeneralContext)
    const auth = useContext(AuthContext);

    const navLinks =
        auth.userRole === 'teacher' ?
            [
                { id: 1, label: 'Home', path: '/', icon: <Home size={24} />, end: true },
                { id: 2, label: 'Absen', path: '/scan/select-class', icon: <Icon icon="uil:qrcode-scan" width="24" height="24" />, },
                { id: 3, label: 'Materi', path: '/materialProgress', icon: <Icon icon="bi:journal-check" width="24" height="24" /> },
            ] : auth.userRole === 'munaqisy' ?
                [
                    { id: 2, label: 'Munaqosah', path: '/munaqasyah/scanner', icon: <Icon icon="uil:qrcode-scan" width="24" height="24" />, },
                ] :
                [

                ]

    const handleNavigation = (e) => {
        if (general.navigateBlockMessage) {
            if (general.navigateBlockMessage !== true) {
                e.preventDefault();
                alert(general.navigateBlockMessage);
            }
        }
    }

    return (
        <div className="bg-white border-t border-gray-200 flex flex-grow justify-around items-center h-16 fixed bottom-0 w-full transition-all duration-300">
            {navLinks.map((link, index) => (
                <button key={index} className='basis-16'>
                    <NavLink
                        to={link.path}
                        end={link.end}
                        onClick={handleNavigation}
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