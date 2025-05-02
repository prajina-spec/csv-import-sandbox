import React, { useState, useEffect } from 'react';
import { validateData } from '../api/api';

function DataValidationScreen({ 
  csvData, 
  mappedFields, 
  dataType, 
  nextStep, 
  previousStep, 
  membershipType,
  setValidationResults 
}) {
  const [transformedData, setTransformedData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [headers, setHeaders] = useState([]);

  // Transform the data on component mount
  useEffect(() => {
    transformData();
  }, []);

  // Transform the CSV data using the field mappings
  const transformData = () => {
    const mappedRows = csvData.map((row, rowIndex) => {
      const mapped = { rowId: rowIndex }; // Add a unique identifier for each row
      
      Object.keys(mappedFields).forEach(csvField => {
        if (mappedFields[csvField]) {
          mapped[mappedFields[csvField]] = row[csvField];
        }
      });
      
      if (dataType === 'memberships') {
        mapped.membership_type_id = membershipType;
      }
      
      return mapped;
    });

    setTransformedData(mappedRows);
    
    // Get headers from the first row
    if (mappedRows.length > 0) {
      const headerFields = Object.keys(mappedRows[0])
        .filter(header => header !== 'rowId'); // Don't show rowId in the table
      setHeaders(headerFields);
    }
    
    validateTransformedData(mappedRows);
  };

  // Validate the transformed data
  const validateTransformedData = async (rows) => {
    setIsLoading(true);
    try {
      const response = await validateData(dataType, rows);
      
      // Convert array of errors to an object with row indices as keys
      const errorsByRow = {};
      response.data.errors.forEach(error => {
        const match = error.match(/ID\s+(\w+)/);
        if (match) {
          const customerId = match[1];
          // Find row with this customer ID
          const rowIndex = rows.findIndex(row => 
            row.customerId === customerId || row.CUSTOMER_ID === customerId
          );
          
          if (rowIndex !== -1) {
            if (!errorsByRow[rowIndex]) {
              errorsByRow[rowIndex] = [];
            }
            errorsByRow[rowIndex].push(error);
          }
        }
      });
      
      setErrors(errorsByRow);
      setValidationResults(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Validation error', err);
      setIsLoading(false);
    }
  };

  // Handle editing a cell
  const startEditing = (rowIndex, field, value) => {
    setEditingCell({ rowIndex, field });
    setCellValue(value);
  };

  // Save the edited cell value
  const saveEdit = () => {
    if (!editingCell) return;
    
    const { rowIndex, field } = editingCell;
    const updatedData = [...transformedData];
    updatedData[rowIndex][field] = cellValue;
    
    setTransformedData(updatedData);
    setEditingCell(null);
    
    // Re-validate the data after editing
    validateTransformedData(updatedData);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Handle key press in editing mode
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Delete a row
  const deleteRow = (rowIndex) => {
    const updatedData = transformedData.filter((_, index) => index !== rowIndex);
    setTransformedData(updatedData);
    
    // Remove any errors for this row
    const updatedErrors = { ...errors };
    delete updatedErrors[rowIndex];
    setErrors(updatedErrors);
    
    // Re-validate the data after deleting
    validateTransformedData(updatedData);
  };

  // Proceed to next step with validated data
  const handleProceed = () => {
    setValidationResults({ cleanRows: transformedData });
    nextStep();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Data Validation</h2>
      <p className="mb-4">
        Please review your data below. You can edit cells by clicking on them, 
        and remove rows using the delete button.
      </p>
      
      {isLoading ? (
        <div className="flex justify-center my-8">
          <p>Validating data...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Row</th>
                  {headers.map((header) => (
                    <th key={header} className="py-2 px-4 border-b text-left">
                      {header}
                    </th>
                  ))}
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transformedData.map((row, rowIndex) => {
                  const hasError = errors[rowIndex];
                  return (
                    <tr 
                      key={rowIndex} 
                      className={`${hasError ? 'bg-red-100' : rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <td className="py-2 px-4 border-b">
                        {rowIndex + 1}
                        {hasError && (
                          <div className="text-red-600 text-xs mt-1">
                            {errors[rowIndex].map((error, i) => (
                              <div key={i}>{error}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      {headers.map((header) => (
                        <td 
                          key={`${rowIndex}-${header}`} 
                          className="py-2 px-4 border-b"
                          onClick={() => startEditing(rowIndex, header, row[header])}
                        >
                          {editingCell && 
                           editingCell.rowIndex === rowIndex && 
                           editingCell.field === header ? (
                            <input
                              type="text"
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={handleKeyPress}
                              className="w-full p-1 border border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <span className="cursor-pointer hover:bg-blue-100 p-1 block">
                              {row[header]}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-4 border-b">
                        <button 
                          onClick={() => deleteRow(rowIndex)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
              <p className="font-bold">Warning</p>
              <p>There are validation errors in your data. You can still proceed, but these rows may cause issues.</p>
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-6">
            <button onClick={previousStep} className="text-blue-500 underline">
              Back
            </button>
            <button 
              onClick={handleProceed} 
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Proceed to Import
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DataValidationScreen;
