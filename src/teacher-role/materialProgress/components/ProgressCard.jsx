import FloatingMenu from "../../../shared/Components/UIElements/FloatingMenu";
import { Pencil, Trash } from "lucide-react";
import { formatDate, formatTime } from "../utils/dateUtils";

const ProgressCard = ({ progress }) => {
    return (
        <div className="card-basic mx-4 rounded-3xl shadow-xs justify-start">
            <div className="flex justify-between w-full">
                <div className="flex flex-col">
                    <div className="flex flex-col">
                        <p className="text-xs text-gray-400 font-medium uppercase">
                            {formatDate(progress.forDate)}
                        </p>
                        <p className="text-xs text-gray-400 font-medium uppercase">
                            {formatTime(progress.forDate)}
                        </p>
                        <h3 className="my-2 text-gray-700 font-medium">
                            {progress.category}
                        </h3>
                        <p className=" text-gray-800 font-normal text-justify">
                            {progress.material}
                        </p>
                    </div>
                </div>
                <FloatingMenu
                    style="flex items-center gap-2 p-2 border border-gray-300 bg-white hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                    buttons={[
                        {
                            icon: Pencil,
                            label: "Edit",
                        },
                        {
                            icon: Trash,
                            label: "Delete",
                            variant: "danger",
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default ProgressCard;
