import React from 'react';
import { importData } from '../api/api';

function ImportSummary({ validationResults, setValidationResults }) {
  const handleDownloadClean = async () => {
    const response = await fetch('/api/upload/export-clean', { method: 'POST' });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean_import.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadErrors = async () => {
    const response = await fetch('/api/upload/export-errors', { method: 'POST' });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'error_report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Import Summary</h2>
      <div className="flex flex-col items-center space-y-4">
        <button onClick={handleDownloadClean} className="bg-blue-600 text-white px-6 py-3 rounded">
          Download Cleaned CSV
        </button>
        <button onClick={handleDownloadErrors} className="bg-red-500 text-white px-6 py-3 rounded">
          Download Errors CSV
        </button>
      </div>
    </div>
  );
}

export default ImportSummary;
