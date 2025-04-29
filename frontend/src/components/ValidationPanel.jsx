import React, { useState } from 'react';
import { validateData } from '../api/api';

function ValidationPanel({ csvData, mappedFields, dataType, nextStep, previousStep, membershipType }) {
  const [errors, setErrors] = useState([]);
  const [ready, setReady] = useState(false);

  const handleValidate = async () => {
    const mappedRows = csvData.map(row => {
      const mapped = {};
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

    try {
      const response = await validateData(dataType, mappedRows);
      setErrors(response.data.errors);
      setReady(true);
    } catch (err) {
      console.error('Validation error', err);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Validate Data</h2>
      <button onClick={handleValidate} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
        Run Validation
      </button>

      {errors.length > 0 && (
        <div className="text-red-600 mb-4">
          <h3 className="font-bold">Validation Errors:</h3>
          <ul className="text-left inline-block">
            {errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={previousStep} className="text-blue-500 underline">Back</button>
        <button onClick={nextStep} disabled={!ready} className="bg-green-600 text-white px-4 py-2 rounded">
          Next
        </button>
      </div>
    </div>
  );
}

export default ValidationPanel;
