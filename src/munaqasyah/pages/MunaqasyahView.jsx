import React from 'react'
import { Link } from 'react-router-dom'

import { LibraryBig, Package } from 'lucide-react'

const MunaqasyahView = () => {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Menu Munaqosah</h1>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <Link to="/munaqasyah/question-package" className='card-interactive m-0 md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <Package size={48} />
                            <div className='font-semibold'>Paket Soal</div>
                        </div>
                    </Link>

                    <Link to="/munaqasyah/question-bank" className='card-interactive m-0 md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
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