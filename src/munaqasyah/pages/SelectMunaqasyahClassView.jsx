import { LibraryBig } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const SelectMunaqasyahClassView = () => {

    const classGrades = [
        { grade: "pra-paud", value: 'Kelas Pra-Paud' },
        { grade: "paud", value: 'Kelas Paud' },
        { grade: "1", value: 'Kelas 1' },
        { grade: "2", value: 'Kelas 2' },
        { grade: "3", value: 'Kelas 3' },
        { grade: "4", value: 'Kelas 4' },
        { grade: "5", value: 'Kelas 5' },
        { grade: "6", value: 'Kelas 6' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex md:flex-row flex-wrap justify-between md:justify-start gap-4 md:gap-8">
                    {classGrades.map((grade) => (
                        <Link to={`/munaqasyah/question-bank/${grade.grade}`} className='card-interactive justify-start min-h-16 min-w-40 max-w-[10.5rem] md:min-h-40 md:min-w-80 md:max-w-96 rounded-md items-center md:p-8 m-0 gap-4'>
                            <div className="mx-4 flex flex-col items-start gap-2 ">
                                <h1 className="text-lg md:text-2xl font-bold">{grade.value.toUpperCase()}</h1>
                                <p className="">85 Soal</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default SelectMunaqasyahClassView