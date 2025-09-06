import { Link } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { classColumns } from "../constants/teachingGroupColumns.jsx";

const ClassesSection = ({
    teachingGroupData,
    auth,
    teachingGroupId,
    lockClassHandler,
    editClassHandler,
    removeClassHandler,
}) => {
    const columns = classColumns(
        teachingGroupId,
        teachingGroupData,
        auth,
        lockClassHandler,
        editClassHandler,
        removeClassHandler
    );

    return (
        <div className="mb-8">
            <div className="mb-2 flex justify-between items-center">
                <div className="flex gap-1 items-center">
                    <h2 className="text-xl font-medium text-gray-800">
                        Kelas Terdaftar
                    </h2>
                </div>
                {auth.userRole === "branchAdmin" &&
                    teachingGroupData?.branchYearId?.academicYearId.isActive &&
                    teachingGroupData?.isLocked === false && (
                        <Link
                            to={`/dashboard/teaching-groups/${teachingGroupId}/add-class`}
                        >
                            <button className="button-primary pl-[11px] mt-0">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Kelas
                            </button>
                        </Link>
                    )}
            </div>
            <DataTable
                data={teachingGroupData?.classes || []}
                columns={columns}
                searchableColumns={["name"]}
                initialSort={{
                    key: "name",
                    direction: "ascending",
                }}
                initialEntriesPerPage={5}
                config={{
                    showSearch: false,
                    showTopEntries: false,
                    showBottomEntries: false,
                    showPagination: false,
                    clickableRows: false,
                    entriesOptions: [5, 10, 20, 30],
                }}
                tableId={`teaching-group-classes-table-${teachingGroupId}`}
            />
        </div>
    );
};

export default ClassesSection;
