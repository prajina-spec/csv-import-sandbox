import React, { useState } from 'react';
import { downloadCleanCsv, downloadErrorCsv } from '../api/api';

function ImportSummary({ validationResults, setValidationResults }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const handleDownloadClean = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/upload/export-clean', { method: 'POST' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clean_import.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadSuccess('clean');
    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadErrors = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/upload/export-errors', { method: 'POST' });
      if (response.status === 400) {
        alert('No error data available to download');
        setIsDownloading(false);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'error_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadSuccess('errors');
    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const resetImport = () => {
    // This would reset to the first step in your app
    window.location.reload();
  };

  // Calculate stats
  const stats = {
    totalRows: validationResults?.cleanRows?.length || 0,
    errorRows: Object.keys(validationResults?.rowErrors || {}).length || 0
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-6">Import Summary</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-600">Total Records</h3>
            <p className="text-3xl font-bold">{stats.totalRows}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-600">Records with Errors</h3>
            <p className="text-3xl font-bold">{stats.errorRows}</p>
          </div>
        </div>
        
        {downloadSuccess === 'clean' && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>Successfully downloaded clean data!</p>
          </div>
        )}
        
        {downloadSuccess === 'errors' && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p>Successfully downloaded error report!</p>
          </div>
        )}
        
        {downloadSuccess === false && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>An error occurred during download. Please try again.</p>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <button 
            onClick={handleDownloadClean} 
            disabled={isDownloading} 
            className={`w-64 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDownloading ? 'Downloading...' : 'Download Clean Data (CSV)'}
          </button>
          
          {stats.errorRows > 0 && (
            <button 
              onClick={handleDownloadErrors} 
              disabled={isDownloading} 
              className={`w-64 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isDownloading ? 'Downloading...' : 'Download Error Report (CSV)'}
            </button>
          )}
          
          <button 
            onClick={resetImport} 
            className="w-64 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium mt-8"
          >
            Start New Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportSummary;
