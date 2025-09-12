import { formatDate } from "../../shared/Utilities/formatDateToLocal";

/**
 * AccountRequestTable
 * Renders a table of account requests (students or teachers) using dynamic columns.
 * Columns are inferred from data + predefined label map.
 * Props:
 *  - data: array of account objects
 *  - role: optional fixed role ("student" | "teacher") when list homogeneous
 *  - className: optional extra class for wrapper
 */
const LABELS = {
  name: "NAMA",
  dateOfBirth: "TANGGAL LAHIR",
  className: "KELAS",
  email: "EMAIL",
  phone: "NO WA",
  position: "POSISI",
  gender: "JENIS KELAMIN",
  parentName: "NAMA ORANG TUA/WALI",
  parentPhone: "NO WA ORANG TUA",
  address: "ALAMAT"
};

const DATE_FIELDS = new Set(["dateOfBirth"]);

// Order priority for columns
const COLUMN_ORDER = [
  "name",
  "dateOfBirth",
  "className",
  "email",
  "phone",
  "position",
  "gender",
  "parentName",
  "parentPhone",
  "address"
];

function inferColumns(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const presence = new Set();
  data.forEach(obj => {
    Object.keys(obj || {}).forEach(k => {
      if (LABELS[k]) presence.add(k);
    });
  });
  // ensure basic columns
  ["name", "dateOfBirth"].forEach(k => presence.add(k));
  return COLUMN_ORDER.filter(k => presence.has(k));
}

const AccountRequestTable = ({ data = [], role, className = "" }) => {
  const columns = inferColumns(data);

  if (!data || data.length === 0) {
    return (
      <div className={`w-full bg-white shadow-xs rounded-md p-4 ${className}`}>Belum ada data.</div>
    );
  }

  return (
    <div className={`w-full bg-white shadow-xs rounded-md overflow-auto text-nowrap ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col}
                className="border border-gray-200 p-2 text-left font-normal text-gray-500"
              >
                {LABELS[col] || col.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const resolvedRole = row.accountRole || role;
            return (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                {columns.map(col => {
                  let value = row[col];
                  if (col === "className" && resolvedRole !== "student") {
                    // when teacher rows, hide className cell (render '-')
                    value = value || "-";
                  }
                  if (DATE_FIELDS.has(col) && value) {
                    value = formatDate(value);
                  }
                  return (
                    <td key={col} className="border border-gray-200 p-2 align-top max-w-[280px] whitespace-nowrap">{value || "-"}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AccountRequestTable;
