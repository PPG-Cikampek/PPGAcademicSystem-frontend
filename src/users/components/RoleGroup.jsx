import { useMemo, useState } from "react";
import ServerDataTable from "../../shared/Components/UIElements/ServerDataTable";
import { useUsersList } from "../../shared/queries/useUsers";
import getUserRoleTitle from "../../shared/Utilities/getUserRoleTitle";
import { TableColumns } from "../components/TableColumns";
import PropTypes from 'prop-types';

const RoleGroup = ({ role, navigate, handleDeleteUser }) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ key: "name", direction: "asc" });

    const { data, isLoading, isFetching } = useUsersList(
        {
            role,
            page,
            limit: pageSize,
            search: search || undefined,
            sort,
        },
        { keepPreviousData: true }
    );

    const { users = [], total = 0 } = useMemo(
        () => ({ users: data?.users || [], total: data?.total || 0 }),
        [data]
    );

    if (!isLoading && !isFetching && total === 0) return null;

    return (
        <div className="mb-8">
            <h2 className="font-bold text-gray-900 text-lg">
                {getUserRoleTitle(role)}
            </h2>
            <ServerDataTable
                data={users}
                columns={TableColumns(role, navigate, handleDeleteUser)}
                total={total}
                page={page}
                pageSize={pageSize}
                onPageChange={(next) => setPage(next)}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
                search={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                sort={sort}
                onSortChange={(nextSort) => {
                    setSort(nextSort);
                    setPage(1);
                }}
                showFilter={false}
                isLoading={isLoading || isFetching}
                tableId={`users-table-${role}`}
            />
            <hr className="my-8" />
        </div>
    );
};

RoleGroup.propTypes = {
    role: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    handleDeleteUser: PropTypes.func.isRequired,
};

export default RoleGroup;
