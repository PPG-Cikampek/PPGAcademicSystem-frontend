import React, { useContext } from 'react'

import { SidebarContext } from '../../../shared/Components/Context/sidebar-context';

const Profile = ({ user, isLoading }) => {
    const sidebar = useContext(SidebarContext)

    const sidebarHandler = () => {
        sidebar.toggle()
    }

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="bg-white mb-2 p-4 shadow-sm fixed top-0 w-full ">
            <div className="flex items-center space-x-4">
                {!isLoading && user?.image ? (
                    <img
                        onClick={sidebarHandler}
                        src={`${import.meta.env.VITE_BACKEND_URL}/${user.image}`}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border border-gray-200 bg-white focus:bg-gray-200 hover:outline-none hover:ring-1 hover:ring-offset-1 hover:ring-gray-400"
                    />
                ) : (
                    <div
                        onClick={sidebarHandler}
                        className={`${isLoading && 'animate-pulse'} w-12 h-12 rounded-full bg-green-200 text-green-500 flex items-center justify-center font-medium  focus:bg-gray-200 hover:outline-none hover:ring-1 hover:ring-offset-1 hover:ring-gray-400`}
                    >
                        {getInitials(user?.name)}
                    </div>
                )}
                <div>
                    {isLoading && (
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 h-fit space-y-3 py-1 grow">
                                <div className="h-5 w-36 bg-slate-700 rounded"></div>
                                <div className="h-3 w-56 bg-slate-400 rounded"></div>
                            </div>
                        </div>
                    )}
                    {!isLoading && (
                        <>
                            <h2 className="text-xl font-medium">{user.name || 'Unknown'}</h2>
                            <h3 className='font-normal text-gray-600'>
                                {user.userId?.teachingGroupId?.branchId?.name || 'No Branch'} - {user.userId?.teachingGroupId?.name || 'No TeachingGroup'}
                            </h3>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Profile;