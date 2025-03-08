import { LibraryBig } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const MunaqasyahView = () => {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                {/* <div className='card-interactive rounded-md gap-4 md:gap-8 flex-grow items-center justify-start  md:p-8 hover:cursor-default m-0 min-h-16 min-w-40 max-w-[10.5rem] md:min-h-40 md:min-w-80 md:max-w-96'>
                    <LibraryBig className="size-8 md:size-10" />
                    <div className="flex flex-col">
                        <h1 className="text-lg md:text-3xl font-bold">Bank Soal</h1>
                        <p className="">{"Desa"}</p>
                    </div>
                </div> */}
                <div className="flex md:flex-row gap-4">
                    <Link to="/munaqasyah/question-bank" className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <LibraryBig size={48} />
                            <div className='font-semibold'>Bank Soal</div>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default MunaqasyahView