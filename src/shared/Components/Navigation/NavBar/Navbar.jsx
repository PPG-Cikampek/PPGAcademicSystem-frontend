import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { SidebarContext } from '../../Context/sidebar-context';
import { AuthContext } from '../../Context/auth-context';
import { User, Calendar, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import FloatingMenu from '../../UIElements/FloatingMenu';
import BackButton from '../../UIElements/BackButton';

const Navbar = () => {

    const sidebar = useContext(SidebarContext)
    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    const sidebarHandler = () => {
        sidebar.toggle()
    }

    const ProfileButton = () => {
        return (
            <FloatingMenu
                boxWidth='w-36'
                label={auth.userName}
                style={`btn-secondary-outline-sharp py-3`}
                buttons={[
                    {
                        icon: User,
                        label: 'Profile',
                        onClick: () => navigate(`/profile/${auth.userId}`),
                    },
                    {
                        icon: LogOut,
                        label: 'Logout',
                        variant: 'danger',
                        onClick: () => auth.logout(),
                    },
                ]}
            />
        );
    };

    const formatAcademicYear = (name) => {
        const year = name.substring(0, 4);
        const semester = name.substring(4);
        return `${year}/${parseInt(year) + 1} ${semester === '1' ? 'Ganjil' : 'Genap'}`;
    };


    const navLinks = [
        ...(auth.currentTeachingGroupYear ? [
            // { id: 1, name: formatAcademicYear(auth.currentTeachingGroupYear), path: '/settings/academic', icon: <Calendar /> }
        ] : []),
        { id: 2, name: auth.userRole, path: '', icon: <Settings /> },
    ];



    return (
        <nav className="bg-white">
            <div className="px-4 mx-auto w-full">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex gap-6 items-center">
                        <div className="flex flex-shrink-0">
                            <button
                                className="p-2 rounded-full focus:bg-gray-200 hover:outline-none hover:ring-1 hover:ring-offset-1 hover:ring-gray-400"
                                onClick={sidebarHandler}
                            >
                                {sidebar.isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                            </button>
                        </div>

                        <BackButton />
                    </div>


                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.id}
                                to={link.path}
                                className={`btn-secondary-outline-sharp py-3`}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <ProfileButton />
                    </div>

                    {/* Mobile Navigation Icons */}
                    <div className="align-center md:hidden flex space-x-4">
                        {/* {navLinks.map((link) => (
                            <NavLink
                                key={link.id}
                                to={link.path}
                                className={({ isActive }) =>
                                    `p-2 rounded-md ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary hover:text-white'}`
                                }
                            >
                                {link.icon}
                            </NavLink>
                        ))} */}
                        <ProfileButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
