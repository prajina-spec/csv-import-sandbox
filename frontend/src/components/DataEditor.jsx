import React, { useState, useEffect, useMemo } from 'react';
import MappingInterface from './MappingInterface';

const DataEditor = ({ 
  provider,
  importType, 
  transformedData, 
  validationErrors = [], 
  onUpdate, 
  onContinue
}) => {
  const [data, setData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  // Set display names for database columns
  const fieldDisplayNames = {
    // Customer fields
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    secondaryEmail: 'Secondary Email',
    address1: 'Address 1',
    address2: 'Address 2',
    city: 'City',
    state: 'State',
    postalCode: 'Postal Code',
    mobile: 'Mobile Phone',
    emergencyName: 'Emergency Contact',
    emergencyNumber: 'Emergency Phone',
    birthdate: 'Birth Date',
    barcodeId: 'Barcode',
    isActive: 'Active',
    isMinor: 'Minor',
    
    // Membership fields
    membershipTypeId: 'Membership Type',
    startEffectiveDate: 'Start Date',
    endEffectiveDate: 'End Date',
    status: 'Status',
    price: 'Price',
    nextBillDate: 'Next Bill Date',
    isRecurring: 'Recurring',
    billingType: 'Billing Type',
    
    // Passes fields
    passTypeId: 'Pass Type',
    quantity: 'Quantity',
    purchasedQuantity: 'Purchased Qty',
    
    // Waiver fields
    signedDT: 'Signed Date',
    startEffectiveDT: 'Start Date',
    endEffectiveDT: 'End Date',
    
    // Gift Card fields
    amount: 'Amount',
    balance: 'Balance',
    
    // Certification fields
    certificationId: 'Certification',

    // Common fields
    UUID: 'UUID',
    externalId: 'External ID',
    createdAt: 'Created',
    updatedAt: 'Updated'
  };
  
  // Define editable fields for each import type
  const editableFields = {
    customers: [
      'firstName', 'lastName', 'email', 'secondaryEmail', 
      'address1', 'address2', 'city', 'state', 'postalCode',
      'mobile', 'emergencyName', 'emergencyNumber', 'birthdate',
      'barcodeId', 'isActive', 'isMinor'
    ],
    memberships: [
      'membershipTypeId', 'startEffectiveDate', 'endEffectiveDate',
      'status', 'price', 'nextBillDate', 'isRecurring', 'billingType'
    ],
    passes: [
      'passTypeId', 'quantity', 'purchasedQuantity', 'status', 'startEffectiveDate'
    ],
    waivers: [
      'signedDT', 'startEffectiveDT', 'endEffectiveDT', 'status'
    ],
    giftCards: [
      'amount', 'balance', 'isActive'
    ],
    certifications: [
      'certificationId', 'startEffectiveDate', 'endEffectiveDate'
    ]
  };
  
  // Define visible columns for each import type
  const defaultVisibleColumns = {
    customers: [
      'firstName', 'lastName', 'email', 'mobile', 'birthdate', 
      'barcodeId', 'isActive', 'externalId'
    ],
    memberships: [
      'membershipTypeId', 'startEffectiveDate', 'endEffectiveDate',
      'status', 'price', 'nextBillDate', 'isRecurring', 'externalId'
    ],
    passes: [
      'passTypeId', 'quantity', 'status', 'startEffectiveDate', 'externalId'
    ],
    waivers: [
      'signedDT', 'startEffectiveDT', 'endEffectiveDT', 'status', 'externalId'
    ],
    giftCards: [
      'amount', 'balance', 'isActive', 'externalId'
    ],
    certifications: [
      'certificationId', 'startEffectiveDate', 'endEffectiveDate', 'externalId'
    ]
  };
  
  // Load data when component mounts or transformedData changes
  useEffect(() => {
    if (transformedData && transformedData[importType]) {
      // Add an index to each row for reference
      const indexedData = transformedData[importType].map((row, index) => ({
        ...row,
        _rowIndex: index
      }));
      
      setData(indexedData);
      
      // Set default visible columns
      setVisibleColumns(defaultVisibleColumns[importType] || []);
    }
  }, [transformedData, importType]);
  
  // Get all available columns from the data
  const allColumns = useMemo(() => {
    if (data.length > 0) {
      return Object.keys(data[0]).filter(key => !key.startsWith('_'));
    }
    return [];
  }, [data]);
  
  // Apply filters and search to the data
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        result = result.filter(row => {
          const rowValue = row[key]?.toString().toLowerCase();
          return rowValue?.includes(value.toLowerCase());
        });
      }
    });
    
    // Apply search across all visible columns
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(row => {
        return visibleColumns.some(column => {
          const value = row[column]?.toString().toLowerCase();
          return value?.includes(searchLower);
        });
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Convert to comparable values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Convert to lowercase strings for comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [data, filters, search, visibleColumns, sortConfig]);
  
  // Update transformed data when data changes
  useEffect(() => {
    if (data.length > 0) {
      // Remove _rowIndex field before updating
      const cleanData = data.map(({ _rowIndex, ...rest }) => rest);
      onUpdate({ ...transformedData, [importType]: cleanData });
    }
  }, [data]);
  
  // Handle column sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle cell editing
  const handleEditCell = (rowIndex, field, value) => {
    setEditingCell({ rowIndex, field });
    setEditValue(value === null ? '' : value.toString());
  };
  
  // Save edited cell value
  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const { rowIndex, field } = editingCell;
    const newData = [...data];
    
    // Convert value to the appropriate type
    let typedValue = editValue;
    
    // Type conversion based on field name or existing value type
    const existingValue = data[rowIndex][field];
    const existingType = typeof existingValue;
    
    if (existingType === 'number') {
      typedValue = parseFloat(editValue) || 0;
    } else if (existingType === 'boolean' || field === 'isActive' || field === 'isMinor' || field === 'isRecurring') {
      typedValue = editValue === 'true' || editValue === '1' || editValue === 1;
    } else if (field.includes('Date')) {
      // Validate date format
      if (/^\d{4}-\d{2}-\d{2}/.test(editValue)) {
        typedValue = editValue;
      } else {
        // Try to parse as date
        const date = new Date(editValue);
        if (!isNaN(date.getTime())) {
          typedValue = date.toISOString().split('T')[0];
        }
      }
    }
    
    newData[rowIndex][field] = typedValue;
    setData(newData);
    setEditingCell(null);
  };
  
  // Cancel cell editing
  const handleCancelEdit = () => {
    setEditingCell(null);
  };
  
  // Handle key press in edit mode
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  
  // Delete a row
  const handleDeleteRow = (rowIndex) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      const newData = data.filter(row => row._rowIndex !== rowIndex);
      // Reindex the rows
      const reindexedData = newData.map((row, index) => ({
        ...row,
        _rowIndex: index
      }));
      setData(reindexedData);
    }
  };
  
  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setVisibleColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(col => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };
  
  // Reset to default columns
  const resetColumns = () => {
    setVisibleColumns(defaultVisibleColumns[importType] || []);
  };
  
  // Check if a field is editable
  const isEditable = (field) => {
    return editableFields[importType]?.includes(field);
  };
  
  // Get display name for a field
  const getDisplayName = (field) => {
    return fieldDisplayNames[field] || field;
  };
  
  // Format cell value for display
  const formatCellValue = (value, field) => {
    if (value === null || value === undefined) {
      return '';
    }
    
    // Format based on field name or value type
    if (field.includes('Date')) {
      // Dates - format as YYYY-MM-DD
      if (typeof value === 'string' && value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    } else if (field === 'isActive' || field === 'isMinor' || field === 'isRecurring') {
      // Boolean fields
      return value ? 'Yes' : 'No';
    } else if (field === 'price' || field === 'amount' || field === 'balance') {
      // Currency fields
      return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
    } else if (field === 'status') {
      // Status field - capitalize
      return typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    } else if (typeof value === 'object') {
      // Objects (like JSON) - stringify
      return JSON.stringify(value);
    }
    
    // Default
    return value.toString();
  };
  
  // Check if a row has validation errors
  const rowHasError = (rowIndex) => {
    return validationErrors.some(error => error.rowIndex === rowIndex);
  };
  
  // Get error messages for a row
  const getRowErrors = (rowIndex) => {
    return validationErrors
      .filter(error => error.rowIndex === rowIndex)
      .map(error => error.message);
  };
  
  // Get error messages for a specific cell
  const getCellErrors = (rowIndex, field) => {
    return validationErrors
      .filter(error => error.rowIndex === rowIndex && error.field === field)
      .map(error => error.message);
  };
  
  // Check if a specific cell has errors
  const cellHasError = (rowIndex, field) => {
    return validationErrors.some(error => 
      error.rowIndex === rowIndex && error.field === field
    );
  };
  
  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearch('');
  };
  
  // Export data to CSV
  const exportToCsv = () => {
    // Get visible data
    const visibleData = filteredData.map(row => {
      const rowData = {};
      visibleColumns.forEach(col => {
        rowData[getDisplayName(col)] = formatCellValue(row[col], col);
      });
      return rowData;
    });
    
    // Convert to CSV
    const headers = visibleColumns.map(col => getDisplayName(col));
    const csvContent = [
      headers.join(','),
      ...visibleData.map(row => headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        return value ? `"${value.toString().replace(/"/g, '""')}"` : '';
      }).join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${importType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate summary statistics
  const getStats = () => {
    return {
      total: data.length,
      filtered: filteredData.length,
      errors: validationErrors.length
    };
  };
  
  const stats = getStats();
  
  return (
    <div className="max-w-full mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit {importType}</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <h3 className="text-lg font-semibold">
              Data Editor
            </h3>
            <div className="text-sm">
              <span className="mr-2">Total: {stats.total}</span>
              <span className="mr-2">Filtered: {stats.filtered}</span>
              <span className="text-red-500">Errors: {stats.errors}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={exportToCsv}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={() => setVisibleColumns(allColumns)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              Show All Columns
            </button>
            <button
              onClick={resetColumns}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              Reset Columns
            </button>
          </div>
        </div>
        
        {/* Show mapping interface for certain import types */}
        {['memberships', 'passes', 'certifications', 'products'].includes(importType) && (
          <MappingInterface
            provider={provider}
            importType={importType}
            transformedData={transformedData}
            onUpdate={onUpdate}
          />
        )}
        
        {/* Search and filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search all visible columns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          {visibleColumns.slice(0, 3).map(column => (
            <div key={column} className="w-40">
              <input
                type="text"
                placeholder={`Filter ${getDisplayName(column)}...`}
                value={filters[column] || ''}
                onChange={e => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          ))}
          
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                {visibleColumns.map(column => (
                  <th 
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center">
                      <span>{getDisplayName(column)}</span>
                      {sortConfig.key === column && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr 
                  key={row._rowIndex} 
                  className={`${rowHasError(row._rowIndex) ? 'bg-red-50' : ''} hover:bg-gray-50`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row._rowIndex + 1}
                  </td>
                  
                  {visibleColumns.map(column => (
                    <td 
                      key={`${row._rowIndex}-${column}`} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        cellHasError(row._rowIndex, column) ? 'bg-red-100' : ''
                      }`}
                      onClick={() => isEditable(column) && handleEditCell(row._rowIndex, column, row[column])}
                    >
                      {editingCell && 
                       editingCell.rowIndex === row._rowIndex && 
                       editingCell.field === column ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={handleKeyPress}
                          className="w-full p-1 border border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className={isEditable(column) ? "cursor-pointer hover:bg-blue-100 p-1" : "p-1"}>
                            {formatCellValue(row[column], column)}
                          </span>
                          {cellHasError(row._rowIndex, column) && (
                            <span className="text-xs text-red-500">
                              {getCellErrors(row._rowIndex, column)[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteRow(row._rowIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td 
                    colSpan={visibleColumns.length + 2} 
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Column selector dropdown */}
        <div className="mt-4 flex justify-between items-center">
          <div className="relative inline-block text-left">
            <div>
              <button 
                type="button" 
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => document.getElementById('column-dropdown').classList.toggle('hidden')}
              >
                Columns
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div 
              id="column-dropdown" 
              className="hidden origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
                {allColumns.map(column => (
                  <div 
                    key={column} 
                    className="px-4 py-2 text-sm flex items-center hover:bg-gray-100"
                    onClick={() => toggleColumnVisibility(column)}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{getDisplayName(column)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEditor;
