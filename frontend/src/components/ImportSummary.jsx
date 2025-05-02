import React, { useState, useEffect } from 'react';

const ImportSummary = ({ 
  provider, 
  importTypes, 
  transformedData, 
  validationStatus,
  onExport,
  onReset
}) => {
  const [downloading, setDownloading] = useState({});
  const [downloadSuccess, setDownloadSuccess] = useState({});
  
  // Calculate statistics for each imported data type
  const calculateStats = () => {
    const stats = {};
    
    Object.keys(transformedData).forEach(type => {
      if (Array.isArray(transformedData[type])) {
        stats[type] = {
          total: transformedData[type].length,
          validated: validationStatus[type] ? 'Validated' : 'Not Validated'
        };
      }
    });
    
    return stats;
  };
  
  const stats = calculateStats();
  
  // Handle CSV export
  const handleExport = (type) => {
    setDownloading(prev => ({ ...prev, [type]: true }));
    
    try {
      // Extract data for the specific type
      const data = transformedData[type] || [];
      
      // Get column headers
      const headers = data.length > 0 ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that need quotes (contain commas, quotes, or newlines)
            if (value === null || value === undefined) {
              return '';
            } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            } else if (typeof value === 'object') {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            } else {
              return value;
            }
          }).join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update success state
      setDownloadSuccess(prev => ({ ...prev, [type]: true }));
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      setDownloadSuccess(prev => ({ ...prev, [type]: false }));
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }));
    }
  };
  
  // Group and format type name for display
  const formatTypeName = (type) => {
    // Handle special cases
    if (type === 'recurringMemberships' || type === 'nonRecurringMemberships') {
      return 'Memberships';
    }
    
    // Capitalize and handle plural
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Group similar data types
  const groupedTypes = Object.keys(stats).reduce((groups, type) => {
    const groupName = formatTypeName(type);
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(type);
    return groups;
  }, {});
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Import Summary</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {provider} Data Import
          </h3>
          <div className="text-sm text-gray-600">
            {importTypes.length} data types imported
          </div>
        </div>
        
        {/* Provider advice */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-800 mb-1">Next Steps</h4>
          <p className="text-sm text-blue-700">
            {provider === 'RGP' ? (
              <>
                You have successfully prepared your Rock Gym Pro data for import. You'll now need to: 
                1) Download the CSV files below, 2) Send them to your Approach account manager, and 
                3) Schedule a validation call.
              </>
            ) : provider === 'MBO' ? (
              <>
                You have successfully prepared your MindBody Online data for import. You'll now need to: 
                1) Download the CSV files below, 2) Send them to your Approach account manager, and 
                3) Schedule a validation call.
              </>
            ) : (
              <>
                Your data has been successfully formatted for import. Please download all CSV files below 
                and send them to your Approach account manager.
              </>
            )}
          </p>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.keys(groupedTypes).map(groupName => (
            <div key={groupName} className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">{groupName}</h4>
              <ul className="space-y-2">
                {groupedTypes[groupName].map(type => (
                  <li key={type} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {type === groupName.toLowerCase() ? 'Total' : type}:
                    </span>
                    <span className="font-medium">{stats[type].total}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between items-center">
                <span className={`text-xs ${
                  validationStatus[groupedTypes[groupName][0]] 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {validationStatus[groupedTypes[groupName][0]] 
                    ? '✓ Validated' 
                    : '⚠ Not Validated'}
                </span>
                <button
                  onClick={() => handleExport(groupedTypes[groupName][0])}
                  disabled={downloading[groupedTypes[groupName][0]]}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {downloading[groupedTypes[groupName][0]] ? 'Downloading...' : 'Download CSV'}
                </button>
              </div>
              {downloadSuccess[groupedTypes[groupName][0]] === true && (
                <div className="mt-2 text-xs text-green-600">
                  CSV downloaded successfully
                </div>
              )}
              {downloadSuccess[groupedTypes[groupName][0]] === false && (
                <div className="mt-2 text-xs text-red-600">
                  Error downloading CSV
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* All Data Export */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
          <h4 className="font-medium mb-2">All Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Export all data as separate CSV files in a single ZIP archive
          </p>
          <button
            onClick={() => onExport(transformedData)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export All Data (ZIP)
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={onReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Start New Import
          </button>
          <div className="text-sm text-gray-500">
            Import completed on {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary;
