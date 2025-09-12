import { formatDate } from "../../shared/Utilities/formatDateToLocal";
import DataTable from "../../shared/Components/UIElements/DataTable.jsx";
import {
    AnyAccount,
    columnOrder,
    labelMap,
    AccountRole,
} from "../config/requestAccountConfig";

const DATE_FIELDS = new Set(["dateOfBirth"]);

function inferColumns(data: AnyAccount[]): string[] {
    if (!Array.isArray(data) || data.length === 0) return [];
    const presence = new Set<string>();
    data.forEach((obj) => {
        Object.keys(obj || {}).forEach((k) => {
            if (labelMap[k]) presence.add(k);
        });
    });
    ["name", "dateOfBirth"].forEach((k) => presence.add(k));
    return columnOrder.filter((k) => presence.has(k));
}

interface Props {
    data?: AnyAccount[];
    role?: AccountRole | undefined;
    className?: string;
}

const AccountRequestTable = ({ data = [], role, className = "" }: Props) => {
    const cols = inferColumns(data);
    const columns = cols.map((key) => ({
        key,
        label: labelMap[key] || key.toUpperCase(),
        sortable: false,
        render: (row: AnyAccount) => {
            let value: any = (row as any)[key];
            const resolvedRole = row.accountRole || role;
            if (key === "className" && resolvedRole !== "student") {
                value = value || "-";
            }
            if (DATE_FIELDS.has(key) && value) value = formatDate(value);
            return value || "-";
        },
    }));

    return (
        <div className={className}>
            <DataTable
                data={data}
                columns={columns}
                searchableColumns={["name"]}
                config={{
                    showFilter: false,
                    showSearch: false,
                    showTopEntries: false,
                    showBottomEntries: false,
                    showPagination: false,
                    clickableRows: false,
                    entriesOptions: [5, 10, 25],
                }}
                onRowClick={undefined}
                tableId={undefined}
            />
        </div>
    );
};

export default AccountRequestTable;
