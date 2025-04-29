import React, { useState } from 'react';
import SourceSelector from './components/SourceSelector';
import DataTypeSelector from './components/DataTypeSelector';
import CsvUploader from './components/CsvUploader';
import FieldMapper from './components/FieldMapper';
import MembershipTypePicker from './components/MembershipTypePicker';
import ValidationPanel from './components/ValidationPanel';
import ImportSummary from './components/ImportSummary';

function App() {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState('');
  const [dataType, setDataType] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [mappedFields, setMappedFields] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [membershipType, setMembershipType] = useState('');

  const nextStep = () => setStep(prev => prev + 1);
  const previousStep = () => setStep(prev => prev - 1);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">CSV Import Tool (Sandbox)</h1>

      {step === 1 && (
        <SourceSelector source={source} setSource={setSource} nextStep={nextStep} />
      )}
      {step === 2 && (
        <DataTypeSelector dataType={dataType} setDataType={setDataType} nextStep={nextStep} previousStep={previousStep} />
      )}
      {step === 3 && (
        <CsvUploader setCsvData={setCsvData} nextStep={nextStep} previousStep={previousStep} />
      )}
      {step === 4 && (
        <FieldMapper csvData={csvData} mappedFields={mappedFields} setMappedFields={setMappedFields} nextStep={nextStep} previousStep={previousStep} dataType={dataType} />
      )}
      {step === 5 && dataType === 'memberships' && (
        <MembershipTypePicker membershipType={membershipType} setMembershipType={setMembershipType} nextStep={nextStep} previousStep={previousStep} />
      )}
      {step === 5 && dataType !== 'memberships' && (
        <ValidationPanel 
          csvData={csvData} 
          mappedFields={mappedFields} 
          dataType={dataType} 
          nextStep={nextStep} 
          previousStep={previousStep} 
          membershipType={membershipType} 
        />
      )}
      {step === 6 && (
        <ImportSummary validationResults={validationResults} setValidationResults={setValidationResults} />
      )}
    </div>
  );
}

export default App;
