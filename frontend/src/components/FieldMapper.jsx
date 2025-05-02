import React, { useState, useEffect } from 'react';
import { FIELD_MAPPINGS } from '../config/mappings';

function FieldMapper({ csvData, mappedFields, setMappedFields, nextStep, previousStep, dataType }) {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [autoMapDone, setAutoMapDone] = useState(false);
  const [missingRequiredFields, setMissingRequiredFields] = useState([]);
  
  // Get available target fields based on the data type
  const targetFields = FIELD_MAPPINGS[dataType] || [];

  useEffect(() => {
    if (csvData.length > 0) {
      const headers = Object.keys(csvData[0]);
      setCsvHeaders(headers);
      
      // Auto-suggest mappings when component mounts
      if (!autoMapDone) {
        autoSuggestMappings(headers);
        setAutoMapDone(true);
      }
    }
  }, [csvData]);

  useEffect(() => {
    // Check for missing required fields
    const requiredFields = targetFields
      .filter(field => field.required)
      .map(field => field.targetField);
      
    const mappedTargetFields = Object.values(mappedFields).filter(Boolean);
    
    const missing = requiredFields.filter(
      field => !mappedTargetFields.includes(field)
    );
    
    setMissingRequiredFields(missing);
  }, [mappedFields]);

  // Auto-suggest mappings based on field name similarity
  const autoSuggestMappings = (headers) => {
    const suggestions = {};
    
    headers.forEach(csvHeader => {
      const normalizedCsvHeader = csvHeader.toLowerCase().replace(/[_\s]/g, '');
      
      // Find the best match
      let bestMatch = null;
      let bestScore = 0;
      
      targetFields.forEach(field => {
        const normalizedTarget = field.sourceField.toLowerCase().replace(/[_\s]/g, '');
        
        // Check for exact match
        if (normalizedCsvHeader === normalizedTarget) {
          bestMatch = field.targetField;
          bestScore = 1;
          return;
        }
        
        // Check if one contains the other
        if (normalizedCsvHeader.includes(normalizedTarget) || 
            normalizedTarget.includes(normalizedCsvHeader)) {
          const score = 0.8;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = field.targetField;
          }
        }
        
        // Check for partial matches
        const minLength = Math.min(normalizedCsvHeader.length, normalizedTarget.length);
        let matchChars = 0;
        for (let i = 0; i < minLength; i++) {
          if (normalizedCsvHeader[i] === normalizedTarget[i]) {
            matchChars++;
          }
        }
        
        const score = matchChars / Math.max(normalizedCsvHeader.length, normalizedTarget.length);
        if (score > 0.6 && score > bestScore) {
          bestScore = score;
          bestMatch = field.targetField;
        }
      });
      
      if (bestMatch && bestScore > 0.6) {
        suggestions[csvHeader] = bestMatch;
      }
    });
    
    setMappedFields(prev => ({...prev, ...suggestions}));
  };

  const handleMappingChange = (csvField, targetField) => {
    setMappedFields({
      ...mappedFields,
      [csvField]: targetField
    });
  };

  const getFieldDescription = (targetField) => {
    const field = targetFields.find(f => f.targetField === targetField);
    return field?.description || '';
  };

  const isFieldRequired = (targetField) => {
    return targetFields.some(field => field.targetField === targetField && field.required);
  };
  
  const isMappingComplete = () => {
    return missingRequiredFields.length === 0;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Map CSV Fields</h2>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Match your CSV columns to the corresponding fields in our system. 
          Required fields are marked with an asterisk (*).
          We've automatically suggested mappings where possible.
        </p>
      </div>
      
      {missingRequiredFields.length > 0 && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800 font-semibold">
            The following required fields still need to be mapped:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-800 mt-2">
            {missingRequiredFields.map(field => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">CSV Column</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">System Field</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Description</th>
            </tr>
          </thead>
          <tbody>
            {csvHeaders.map((header) => {
              const selectedField = mappedFields[header] || '';
              const description = getFieldDescription(selectedField);
              
              return (
                <tr key={header} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b border-gray-200">{header}</td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <select
                      value={selectedField}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Do not import --</option>
                      {targetFields.map(mapping => (
                        <option key={mapping.targetField} value={mapping.targetField}>
                          {mapping.targetField}{mapping.required ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">
                    {description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center space-x-4 mt-8">
        <button onClick={previousStep} className="text-blue-500 underline">
          Back
        </button>
        <button 
          onClick={nextStep} 
          className={`px-6 py-2 rounded-lg ${
            isMappingComplete() 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isMappingComplete()}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FieldMapper;
