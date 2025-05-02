import React, { useState } from 'react';
import SourceSelector from './components/SourceSelector';
import DataTypeSelector from './components/DataTypeSelector';
import CsvUploader from './components/CsvUploader';
import FieldMapper from './components/FieldMapper';
import MembershipTypePicker from './components/MembershipTypePicker';
import ValidationPanel from './components/ValidationPanel';
import DataValidationScreen from './components/DataValidationScreen';
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SourceSelector source={source} setSource={setSource} nextStep={nextStep} />;
      case 2:
        return <DataTypeSelector dataType={dataType} setDataType={setDataType} nextStep={nextStep} previousStep={previousStep} />;
      case 3:
        return <CsvUploader setCsvData={setCsvData} nextStep={nextStep} previousStep={previousStep} />;
      case 4:
        return <FieldMapper csvData={csvData} mappedFields={mappedFields} setMappedFields={setMappedFields} nextStep={nextStep} previousStep={previousStep} dataType={dataType} />;
      case 5:
        if (dataType === 'memberships') {
          return <MembershipTypePicker membershipType={membershipType} setMembershipType={setMembershipType} nextStep={nextStep} previousStep={previousStep} />;
        } else {
          return <ValidationPanel 
            csvData={csvData} 
            mappedFields={mappedFields} 
            dataType={dataType} 
            nextStep={nextStep} 
            previousStep={previousStep} 
            membershipType={membershipType}
            setValidationResults={setValidationResults}
          />;
        }
      case 6:
        if (dataType === 'memberships') {
          return <DataValidationScreen 
            csvData={csvData} 
            mappedFields={mappedFields} 
            dataType={dataType} 
            nextStep={nextStep} 
            previousStep={previousStep} 
            membershipType={membershipType} 
            setValidationResults={setValidationResults}
          />;
        } else {
          return <ImportSummary validationResults={validationResults} setValidationResults={setValidationResults} />;
        }
      case 7:
        return <ImportSummary validationResults={validationResults} setValidationResults={setValidationResults} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">CSV Import Tool (Sandbox)</h1>
      
      {/* Step Indicator */}
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {[
            "Source", 
            "Type", 
            "Upload", 
            "Map Fields", 
            dataType === 'memberships' ? "Membership Type" : "Validation",
            dataType === 'memberships' ? "Data Review" : "Summary",
            dataType === 'memberships' ? "Summary" : ""
          ]
            .filter(label => label !== "")
            .map((label, i) => (
              <li key={i} className={`flex items-center ${i+1 === step ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${i+1 === step ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'} mr-2`}>
                  {i+1}
                </span>
                {label}
                {i < 6 && <div className="w-8 mx-2 h-0.5 bg-gray-200"></div>}
              </li>
            ))
          }
        </ol>
      </div>

      {renderStep()}
    </div>
  );
}

export default App;
