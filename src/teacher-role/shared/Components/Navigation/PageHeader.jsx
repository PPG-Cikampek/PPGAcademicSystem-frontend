import { useContext } from "react";

import { SidebarContext } from "../../../../shared/Components/Context/sidebar-context";

import { ChevronLeft, ChevronRight } from "lucide-react";
import BackButton from "../../../../shared/Components/UIElements/BackButton";

const PageHeader = ({ page = "PPG Cikampek", children }) => {
    const sidebar = useContext(SidebarContext);

    const sidebarHandler = () => {
        sidebar.toggle();
    };

    return (
        <div className="w-full h-auto">
            <div className="px-3 py-2 flex bg-white items-center gap-2 shadow-xs">
                <button
                    className="p-2 rounded-full focus:bg-gray-200 hover:outline-hidden hover:ring-1 hover:ring-offset-1 hover:ring-gray-400"
                    onClick={sidebarHandler}
                >
                    {sidebar.isSidebarOpen ? (
                        <ChevronLeft size={24} />
                    ) : (
                        <ChevronRight size={24} />
                    )}
                </button>
                {/* <h2 className='text-lg'>{page}</h2> */}
                <BackButton />
            </div>
            {children}
        </div>
    );
};

export default PageHeader;
