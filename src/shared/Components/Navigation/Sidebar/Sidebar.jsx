import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarContext } from '../../Context/sidebar-context';
import { AuthContext } from '../../Context/auth-context';
import { LogOut } from 'lucide-react';
import logo from '../../../../assets/logos/ppgcikampek.webp';

import { ChevronDown, ChevronUp } from 'lucide-react';

const Sidebar = ({ linksList, children }) => {
    const [expandedMenu, setExpandedMenu] = useState(null);

    const sidebar = useContext(SidebarContext);
    const auth = useContext(AuthContext);

    const sidebarHandler = () => {
        sidebar.toggle();
    };

    const toggleSubMenu = (menu) => {
        setExpandedMenu((prev) => (prev === menu ? null : menu));
    };

    return (
        <div className="relative h-screen md:h-dvh md:flex">
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
                    h-full
                    bg-white text-gray-800 border-gray-200 
                    transition-all duration-300 ease-in-out
                    z-30 opacity-0 md:opacity-100
                    ${sidebar.isSidebarOpen ? 'w-64 translate-x-0 opacity-100' : 'w-16 -translate-x-full md:translate-x-0'}
                `}
            >
                <div className={`m-2 mb-6 flex items-center justify-start gap-2 border-gray-200`}>
                    <img src={logo} className={`font-normal size-12`} />
                    <span className={`shrink-0 text-2xl font-semibold text-primary ${sidebar.isSidebarOpen ? 'block' : 'hidden'}`}>PPG Cikampek</span>
                </div>
                <nav className={`mt-4 ${sidebar.isSidebarOpen ? 'min-w-64' : ''}`}>
                    <ul className="mt-4 space-}y-2">
                        {linksList.map((link, index) => (
                            <li key={index} className="relative">
                                <NavLink
                                    to={link.link ? link.link : null}
                                    end={link.end}
                                    onClick={() => {
                                        if (link.subOptions) {
                                            toggleSubMenu(link.label);
                                        } else if (sidebar.isSidebarOpen && !window.matchMedia('(min-width: 768px)').matches) {
                                            sidebar.toggle();
                                        }
                                    }}
                                    className={({ isActive }) => `
                                        flex items-center px-4 py-3 
                                        hover:bg-gray-100 
                                        focus:outline-none focus:ring-primary-subtle
                                        ${isActive && link.link ? 'bg-gray-100 text-primary font-medium' : 'text-gray-800'} 
                                        ${sidebar.isSidebarOpen ? 'justify-start' : 'justify-center'}
                                    `}
                                >
                                    {link.icon}
                                    <span className={`shrink-0 ml-3 text-clip ${sidebar.isSidebarOpen ? 'block' : 'hidden'}`}>{link.label}</span>
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
                                                    className={({ isActive }) => ` flex items-center px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-primary-subtle ${isActive ? 'bg-gray-100 text-primary font-medium' : 'text-gray-800'} `}
                                                    onClick={() => {
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
                {auth.userRole === 'teacher' && (
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
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default Sidebar;
