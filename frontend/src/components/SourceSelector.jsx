import React from 'react';

function SourceSelector({ source, setSource, nextStep }) {
  const handleSelect = (value) => {
    setSource(value);
    nextStep();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Select Previous Software</h2>
      <div className="flex justify-center space-x-4">
        <button onClick={() => handleSelect('RGP')} className="bg-blue-500 text-white px-4 py-2 rounded">Rock Gym Pro (RGP)</button>
        <button onClick={() => handleSelect('MBO')} className="bg-green-500 text-white px-4 py-2 rounded">MindBody Online (MBO)</button>
        <button onClick={() => handleSelect('Other')} className="bg-gray-500 text-white px-4 py-2 rounded">Other</button>
      </div>
    </div>
  );
}

export default SourceSelector;
