import React, { useState } from 'react';
import Papa from 'papaparse';

function CsvUploader({ setCsvData, nextStep, previousStep }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setCsvData(results.data);
      }
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Upload Your CSV File</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
      {fileName && <p className="mb-2">File selected: {fileName}</p>}
      <div className="flex justify-center space-x-4">
        <button onClick={previousStep} className="text-blue-500 underline">Back</button>
        <button onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!fileName}>
          Next
        </button>
      </div>
    </div>
  );
}

export default CsvUploader;
