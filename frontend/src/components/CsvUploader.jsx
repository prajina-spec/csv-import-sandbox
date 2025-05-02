import React, { useState } from 'react';
import Papa from 'papaparse';
import CsvPreview from './CsvPreview';

function CsvUploader({ setCsvData, nextStep, previousStep }) {
  const [fileName, setFileName] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [stats, setStats] = useState({
    rows: 0,
    columns: 0
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setParseError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.errors.length > 0) {
          setParseError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        
        setCsvData(results.data);
        setPreviewData(results.data);
        setStats({
          rows: results.data.length,
          columns: results.meta.fields.length
        });
      },
      error: function(error) {
        setParseError(`Error reading file: ${error.message}`);
      }
    });
  };

  const handleDownloadTemplate = () => {
    // Sample template data based on dataType
    // This would ideally come from your config or API
    const templateHeaders = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const templateData = [
      templateHeaders.join(','),
      'John,Doe,john@example.com,123-456-7890,"123 Main St"',
      'Jane,Smith,jane@example.com,987-654-3210,"456 Oak Ave"'
    ].join('\n');
    
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Upload Your CSV File</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-700">
          Upload a CSV file containing your data. Make sure your file has headers in the first row.
          Need a template? <button onClick={handleDownloadTemplate} className="text-blue-700 underline">Download template</button>
        </p>
      </div>
      
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">.CSV files only</p>
          </div>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>
      </div>

      {parseError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {parseError}
        </div>
      )}
      
      {fileName && !parseError && (
        <div className="mt-4">
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <div>
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-gray-600">{stats.rows} rows, {stats.columns} columns</p>
            </div>
            <div>
              <button 
                onClick={() => {
                  setFileName('');
                  setPreviewData([]);
                  setCsvData([]);
                }}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
          
          <CsvPreview data={previewData} maxRows={5} />
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-8">
        <button onClick={previousStep} className="text-blue-500 underline">Back</button>
        <button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg" disabled={!fileName || parseError}>
          Next
        </button>
      </div>
    </div>
  );
}

export default CsvUploader;
