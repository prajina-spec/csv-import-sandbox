import React, { useState, useEffect } from 'react';
import { FIELD_MAPPINGS } from '../config/mappings';

function FieldMapper({ csvData, mappedFields, setMappedFields, nextStep, previousStep, dataType }) {
  const [csvHeaders, setCsvHeaders] = useState([]);

  useEffect(() => {
    if (csvData.length > 0) {
      setCsvHeaders(Object.keys(csvData[0]));
    }
  }, [csvData]);

  const handleMappingChange = (csvField, targetField) => {
    setMappedFields({
      ...mappedFields,
      [csvField]: targetField
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Map CSV Fields</h2>
      <div className="overflow-x-auto">
        <table className="table-auto mx-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">CSV Column</th>
              <th className="px-4 py-2">Mapped Field</th>
            </tr>
          </thead>
          <tbody>
            {csvHeaders.map((header) => (
              <tr key={header}>
                <td className="border px-4 py-2">{header}</td>
                <td className="border px-4 py-2">
                  <select
                    value={mappedFields[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                  >
                    <option value="">-- Do not import --</option>
                    {FIELD_MAPPINGS[dataType].map(mapping => (
                      <option key={mapping.targetField} value={mapping.targetField}>
                        {mapping.targetField}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={previousStep} className="text-blue-500 underline">Back</button>
        <button onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded">
          Next
        </button>
      </div>
    </div>
  );
}

export default FieldMapper;
