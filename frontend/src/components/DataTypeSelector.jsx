import React from 'react';

function DataTypeSelector({ dataType, setDataType, nextStep, previousStep }) {
  const handleSelect = (value) => {
    setDataType(value);
    nextStep();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Select Data Type</h2>
      <div className="flex justify-center space-x-4">
        <button onClick={() => handleSelect('customers')} className="bg-blue-600 text-white px-4 py-2 rounded">Customers</button>
        <button onClick={() => handleSelect('memberships')} className="bg-green-600 text-white px-4 py-2 rounded">Memberships</button>
      </div>
      <div className="mt-6">
        <button onClick={previousStep} className="text-blue-500 underline">Back</button>
      </div>
    </div>
  );
}

export default DataTypeSelector;
