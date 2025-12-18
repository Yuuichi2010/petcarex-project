import React from 'react';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-purple-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((column, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-gray-600">
                  {column.render ? column.render(row) : row[column.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;