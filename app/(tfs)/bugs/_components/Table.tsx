import React from "react";

interface TableProps {
  columns: { key: string; label: string; visible: boolean }[];
  data: any[];
  onSort?: (key: string) => void;
  onRowClick?: (row: any) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, onSort, onRowClick }) => {
  return (
    <div className="table-container overflow-x-auto">
      <table className="table-auto w-full border rounded-md">
        <thead className="bg-gray-200 dark:bg-gray-800">
          <tr>
            {columns.map(
              (col) =>
                col.visible && (
                  <th
                    key={col.key}
                    onClick={() => onSort && onSort(col.key)}
                    className="py-2 px-4 text-left cursor-pointer"
                  >
                    {col.label}
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick && onRowClick(row)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              {columns.map(
                (col) =>
                  col.visible && (
                    <td key={`${row.id}-${col.key}`} className="py-2 px-4">
                      {row[col.key] || "N/A"}
                    </td>
                  )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
