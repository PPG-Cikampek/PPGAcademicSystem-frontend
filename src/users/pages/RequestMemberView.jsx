import React from 'react'
import { GraduationCap, Presentation, Users, House, Gauge, UserRoundPlus, UserCog, Layers2, FolderCog, CalendarCog, ArrowRightLeft } from 'lucide-react';


const RequestMemberView = () => {
    return (
        <div className="container mx-auto p-6 max-w-4xl ">
            <div className="flex flex-col md:flex-row my-24 md:my-48 gap-4 md:mr-24">
                <div className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
                    <div className="mx-auto flex items-center gap-2 ">
                        <GraduationCap size={48} />
                        <div className='font-semibold'>Akun Guru</div>
                    </div>
                </div>
                <div className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center mb-12 gap-4'>
                    <div className="mx-auto flex items-center gap-2 ">
                        <Users size={48} />
                        <div className='font-semibold'>Akun Siswa</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RequestMemberView