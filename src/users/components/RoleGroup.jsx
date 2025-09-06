import DataTable from "../../shared/Components/UIElements/DataTable";
import getUserRoleTitle from "../../shared/Utilities/getUserRoleTitle";
import { TableColumns } from "../components/TableColumns";

const RoleGroup = ({ role, users, navigate, handleDeleteUser, isLoading }) => {
    const roleUsers = users.filter((user) => user.role === role);
    if (!isLoading && roleUsers.length === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900">
                {getUserRoleTitle(role)}
            </h2>
            <DataTable
                data={roleUsers}
                columns={TableColumns(role, navigate, handleDeleteUser)}
                searchableColumns={["name", "email"]}
                initialSort={{
                    key: "name",
                    direction: "ascending",
                }}
                initialEntriesPerPage={5}
                config={{
                    showSearch: true,
                    showTopEntries: true,
                    showBottomEntries: true,
                    showPagination: true,
                    clickeableRows: false,
                    entriesOptions: [5, 10, 20, 30],
                }}
                tableId={`users-table-${role}`}
                isLoading={isLoading}
            />
            <hr className="my-8" />
        </div>
    );
};

export default RoleGroup;
