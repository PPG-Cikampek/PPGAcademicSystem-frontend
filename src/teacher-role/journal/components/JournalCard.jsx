import FloatingMenu from "../../../shared/Components/UIElements/FloatingMenu";
import { Pencil, Trash } from "lucide-react";
import { formatDate, formatTime } from "../../../shared/Utilities/dateUtils";

const JournalCard = ({ journal }) => {
    return (
        <div className="card-basic rounded-3xl shadow-xs justify-start">
            <div className="flex justify-between w-full">
                <div className="flex flex-col w-full">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <p className="text-xs text-gray-400 font-medium uppercase">
                                {formatDate(journal.createdAt)}
                            </p>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                                {formatTime(journal.createdAt)}
                            </p>
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
                    <h3 className="my-2 text-gray-700">{journal.title}</h3>
                    <p className="text-gray-800 font-normal text-justify">
                        {journal.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JournalCard;
