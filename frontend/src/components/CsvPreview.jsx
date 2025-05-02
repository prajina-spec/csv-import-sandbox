import React from 'react';

function CsvPreview({ data, maxRows = 5 }) {
  if (!data || data.length === 0) return null;
  
  const headers = Object.keys(data[0]);
  const previewData = data.slice(0, maxRows);
  
  return (
    <div className="mt-4 mb-6">
      <h3 className="text-lg font-medium mb-2">Data Preview</h3>
      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 border-b text-left text-xs">#</th>
              {headers.map(header => (
                <th key={header} className="py-2 px-3 border-b text-left text-xs">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-3 border-b text-sm">{index + 1}</td>
                {headers.map(header => (
                  <td key={`${index}-${header}`} className="py-2 px-3 border-b text-sm">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > maxRows && (
        <div className="text-gray-500 text-sm mt-2 text-center">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
}

export default CsvPreview;
