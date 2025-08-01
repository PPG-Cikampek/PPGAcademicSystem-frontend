import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarContext } from '../../Context/sidebar-context';
import { AuthContext } from '../../Context/auth-context';
import { LogOut } from 'lucide-react';
import logo from '../../../../assets/logos/ppgcikampek.webp';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { GeneralContext } from '../../Context/general-context';
import { formatDate } from '../../../Utilities/formatDateToLocal';

const Sidebar = ({ linksList, children }) => {
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [version, setVersion] = useState(null);

    useEffect(() => {
        const fetchVersion = async () => {
            const response = await fetch('/version.json?t=' + new Date().getTime());
            const data = await response.json();
            setVersion(data);
        };
        fetchVersion();
    }, []);

    const sidebar = useContext(SidebarContext);
    const auth = useContext(AuthContext);
    const general = useContext(GeneralContext)

    // console.log(auth.userRole)

    const sidebarHandler = () => {
        sidebar.toggle();
    };

    const toggleSubMenu = (menu) => {
        setExpandedMenu((prev) => (prev === menu ? null : menu));
    };

    const handleNavigation = (e) => {
        if (general.navigateBlockMessage) {
            if (general.navigateBlockMessage !== true) {
                e.preventDefault();
                alert(general.navigateBlockMessage);
            }
        }
    }

    return (
        <div className="relative h-full md:flex">
            {/* Overlay for mobile when sidebar is open */}
            {sidebar.isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 md:hidden z-20"
                    onClick={sidebarHandler}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed md:relative
                    h-full md:h-[unset]
                    bg-white text-gray-800 border-gray-200 
                    transition-all duration-300 ease-in-out
                    z-30 opacity-0 md:opacity-100
                    ${sidebar.isSidebarOpen ? 'w-64 translate-x-0 opacity-100' : 'w-16 -translate-x-full md:translate-x-0'}
                `}
            >
                <div className={`m-2 mb-6 flex flex-col items-center justify-start gap-2 border-gray-200`}>
                    <div className="flex items-center gap-2">
                        <img src={logo} className={`font-normal size-12`} />
                        <div className="flex flex-col gap-0">
                            <span className={`shrink-0 text-2xl font-semibold text-primary overflow-clip ${sidebar.isSidebarOpen ? 'block' : 'hidden'}`}>PPG Cikampek</span>
                            {version && sidebar.isSidebarOpen && (
                                <span className="text-sm">
                                    v{version.version} - {formatDate(new Date(version.timestamp * 1000), false)}
                                    {/* v{version.version}-{version.timestamp} */}
                                </span>
                            )}
                            {/* {version && sidebar.isSidebarOpen && (
                                <span className="text-sm">
                                    terakhir diperbarui pada {formatDate(new Date(version.timestamp * 1000))}
                                    </span>
                            )} */}
                        </div>
                    </div>
                </div>
                <nav className={`mt-4 ${sidebar.isSidebarOpen ? 'min-w-64' : ''}`}>
                    <ul className="mt-4 space-}y-2">
                        {linksList.map((link, index) => (
                            <li key={index} className="relative">
                                <NavLink
                                    to={link.link ? link.link : null}
                                    end={link.end}
                                    onClick={() => {
                                        handleNavigation()
                                        if (link.subOptions) {
                                            toggleSubMenu(link.label);
                                        } else if (sidebar.isSidebarOpen && !window.matchMedia('(min-width: 768px)').matches) {
                                            sidebar.toggle();
                                        }
                                    }}
                                    className={({ isActive }) => `
                                        flex items-center px-4 py-3 
                                        hover:bg-gray-100
                                        focus:outline-hidden focus:ring-primary-subtle
                                        ${isActive && link.link ? 'bg-gray-100 text-primary font-medium' : 'text-gray-800'} 
                                        ${sidebar.isSidebarOpen && !link.subOptions ? 'justify-start' : sidebar.isSidebarOpen && link.subOptions ? 'justify-between' : 'justify-center'}
                                    `}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <div className='flex items-center'>
                                            {link.icon}
                                            <span className={`shrink-0 ml-3 text-clip ${sidebar.isSidebarOpen ? 'block' : 'hidden'}`}>{link.label}</span>
                                        </div>
                                        <div>
                                            {link.subOptions && expandedMenu !== link.label && window.matchMedia('(min-width: 768px)') && sidebar.isSidebarOpen && (
                                                <ChevronDown />
                                            )}
                                            {link.subOptions && expandedMenu === link.label && window.matchMedia('(min-width: 768px)') && sidebar.isSidebarOpen && (
                                                <ChevronUp />
                                            )}
                                        </div>
                                    </div>
                                </NavLink>

                                {/* Sub-menu */}
                                {link.subOptions && (
                                    <ul
                                        className={` ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out `}
                                        style={{
                                            maxHeight: expandedMenu === link.label ? `${link.subOptions.length * 48}px` : '0px', // Adjust height based on item count
                                        }}
                                    >
                                        {link.subOptions.map((subOption, subIndex) => (
                                            <li key={subIndex}>
                                                <NavLink
                                                    to={subOption.link}
                                                    // onClick={sidebarHandler}
                                                    className={({ isActive }) => ` flex items-center px-4 py-2 text-sm hover:bg-gray-100 focus:outline-hidden focus:ring-primary-subtle ${isActive ? 'bg-gray-100 text-primary font-medium' : 'text-gray-800'} `}
                                                    onClick={() => {
                                                        handleNavigation()
                                                        if (sidebar.isSidebarOpen && !window.matchMedia('(min-width: 768px)').matches) {
                                                            sidebarHandler();
                                                        }
                                                    }}
                                                >
                                                    {subOption.icon}
                                                    <span className={`shrink-0 ml-3 text-clip ${sidebar.isSidebarOpen ? 'block' : 'hidden'}`}>{subOption.label}</span>
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                            </li>
                        ))}
                    </ul>
                </nav>
                {(auth.userRole === 'teacher' || auth.userRole === 'munaqisy' || auth.userRole === 'student') && (
                    <div className="flex items-center justify-end p-4">
                        <button
                            onClick={auth.logout}
                            className="btn-primary-outline flex items-center p-2"
                        >
                            <LogOut size={18} strokeWidth={2.5} />
                            <span className="ml-2">Logout</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 h-fit">
                {children}
            </div>
        </div>
    );
};

export default Sidebar;
