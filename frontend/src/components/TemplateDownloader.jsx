import React from 'react';
import { FIELD_MAPPINGS } from '../config/mappings';

function TemplateDownloader({ dataType }) {
  const downloadTemplate = () => {
    if (!dataType) {
      alert('Please select a data type first');
      return;
    }

    // Get fields for the selected data type
    const fields = FIELD_MAPPINGS[dataType].map(field => field.sourceField);
    
    // Create CSV header row
    let csvContent = fields.join(',') + '\n';
    
    // Add one empty sample row
    csvContent += fields.map(_ => '').join(',') + '\n';
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-4">
      <button
        onClick={downloadTemplate}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
      >
        Download Template CSV
      </button>
    </div>
  );
}

export default TemplateDownloader;
