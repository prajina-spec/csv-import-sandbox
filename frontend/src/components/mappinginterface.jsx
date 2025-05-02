import React, { useState, useEffect } from 'react';
import mappingData from '../data/sampleMapping';

const MappingInterface = ({ 
  provider,
  importType, 
  transformedData, 
  onUpdate
}) => {
  const [rawValues, setRawValues] = useState([]);
  const [mappings, setMappings] = useState({});
  
  // Get available target options based on import type
  const getTargetOptions = () => {
    switch (importType) {
      case 'memberships':
        return mappingData.membershipTypes;
      case 'passes':
        return mappingData.passTypes;
      case 'certifications':
        return mappingData.certificationTypes;
      case 'products':
        return mappingData.revenueCategories;
      default:
        return [];
    }
  };
  
  // Get the field name to map based on import type
  const getSourceFieldName = () => {
    switch (importType) {
      case 'memberships':
        return 'membershipTypeId';
      case 'passes':
        return 'passTypeId';
      case 'certifications':
        return 'certificationId';
      case 'products':
        return 'revenueCategoryId';
      default:
        return '';
    }
  };
  
  // Get display name for the field
  const getFieldDisplayName = () => {
    switch (importType) {
      case 'memberships':
        return 'Membership Type';
      case 'passes':
        return 'Pass Type';
      case 'certifications':
        return 'Certification Type';
      case 'products':
        return 'Revenue Category';
      default:
        return '';
    }
  };
  
  // Extract unique raw values from the data
  useEffect(() => {
    if (!transformedData || !importType) return;
    
    const data = transformedData[importType] || [];
    const fieldName = getSourceFieldName();
    
    if (fieldName && data.length > 0) {
      // Get unique values for the field
      const uniqueValues = [...new Set(
        data.map(row => row[fieldName])
          .filter(Boolean)
          .map(val => val.toString())
      )];
      
      setRawValues(uniqueValues);
      
      // Initialize mappings
      const initialMappings = {};
      const options = getTargetOptions();
      
      uniqueValues.forEach((value, index) => {
        // Try to find existing mapping
        let mappedValue = options[0]?.id;
        
        // For RGP, try to detect based on format
        if (provider === 'RGP' && importType === 'memberships') {
          const matchedType = mappingData.lookupMembershipType(value);
          if (matchedType) mappedValue = matchedType.id;
        }
        // For MBO, try to match by name
        else if (provider === 'MBO') {
          if (importType === 'memberships') {
            const matchedType = mappingData.lookupMembershipType(null, value);
            if (matchedType) mappedValue = matchedType.id;
          } else if (importType === 'passes') {
            const matchedType = mappingData.lookupPassType(value);
            if (matchedType) mappedValue = matchedType.id;
          } else if (importType === 'certifications') {
            const matchedType = mappingData.lookupCertificationType(value);
            if (matchedType) mappedValue = matchedType.id;
          }
        }
        
        // Use round-robin assignment if no match found
        if (!mappedValue) {
          mappedValue = options[index % options.length]?.id;
        }
        
        initialMappings[value] = mappedValue;
      });
      
      setMappings(initialMappings);
    }
  }, [transformedData, importType, provider]);
  
  // Handle mapping change
  const handleMappingChange = (rawValue, targetId) => {
    setMappings(prev => ({
      ...prev,
      [rawValue]: parseInt(targetId)
    }));
  };
  
  // Apply mappings to the data
  const applyMappings = () => {
    if (!transformedData || !importType) return;
    
    const data = [...(transformedData[importType] || [])];
    const fieldName = getSourceFieldName();
    
    if (fieldName && data.length > 0) {
      // Update each row with the mapped value
      const updatedData = data.map(row => {
        if (row[fieldName] && mappings[row[fieldName]]) {
          return {
            ...row,
            [fieldName]: mappings[row[fieldName]]
          };
        }
        return row;
      });
      
      // Update the transformed data
      onUpdate({
        ...transformedData,
        [importType]: updatedData
      });
      
      alert('Mappings applied successfully!');
    }
  };
  
  // No mapping needed for this type
  if (!getSourceFieldName()) {
    return null;
  }
  
  const targetOptions = getTargetOptions();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">
        Map {getFieldDisplayName()}
      </h3>
      
      <p className="text-gray-600 mb-4">
        Map the {getFieldDisplayName()} values from {provider} to Approach's system.
      </p>
      
      {rawValues.length === 0 ? (
        <p className="text-gray-500">No {getFieldDisplayName()} values to map.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {provider} {getFieldDisplayName()}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approach {getFieldDisplayName()}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rawValues.map((value) => (
                  <tr key={value}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={mappings[value] || ''}
                        onChange={(e) => handleMappingChange(value, e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">-- Select --</option>
                        {targetOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={applyMappings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Mappings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MappingInterface;
