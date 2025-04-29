import React, { useEffect, useState } from 'react';
import { fetchMembershipTypes } from '../api/api';

function MembershipTypePicker({ membershipType, setMembershipType, nextStep, previousStep }) {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    fetchMembershipTypes().then(response => {
      setTypes(response.data);
    });
  }, []);

  const handleSelect = (e) => {
    setMembershipType(e.target.value);
  };

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">Select Membership Type for Import</h2>
      <select value={membershipType} onChange={handleSelect} className="border px-4 py-2">
        <option value="">-- Select a membership type --</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      <div className="flex justify-center space-x-4 mt-6">
        <button onClick={previousStep} className="text-blue-500 underline">Back</button>
        <button onClick={nextStep} disabled={!membershipType} className="bg-blue-600 text-white px-4 py-2 rounded">
          Next
        </button>
      </div>
    </div>
  );
}

export default MembershipTypePicker;
