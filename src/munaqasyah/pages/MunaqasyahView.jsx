import React from "react";
import { Link } from "react-router-dom";

import { LibraryBig, Package } from "lucide-react";

const MunaqasyahView = () => {
    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <main className="mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Menu Munaqosah
                    </h1>
                </div>
                <div className="flex md:flex-row flex-col gap-4">
                    <Link
                        to="/munaqasyah/question-package"
                        className="flex justify-between items-center m-0 md:mb-12 rounded-md md:min-w-96 min-h-36 md:min-h-64 card-interactive"
                    >
                        <div className="flex flex-col items-center gap-2 mx-auto">
                            <Package size={48} />
                            <div className="font-semibold">Paket Soal</div>
                        </div>
                    </Link>

                    <Link
                        to="/munaqasyah/question-bank"
                        className="flex justify-between items-center gap-4 m-0 md:mb-12 rounded-md md:min-w-96 min-h-36 md:min-h-64 card-interactive"
                    >
                        <div className="flex flex-col items-center gap-2 mx-auto">
                            <LibraryBig size={48} />
                            <div className="font-semibold">Bank Soal</div>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default MunaqasyahView;
