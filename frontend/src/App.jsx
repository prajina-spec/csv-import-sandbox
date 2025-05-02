import React, { useState } from 'react';
import ProviderDetection from './components/ProviderDetection';
import TransformationEngine from './components/TransformationEngine';
import DataEditor from './components/DataEditor';
import ValidationChecklist from './components/ValidationChecklist';
import ImportSummary from './components/ImportSummary';

function App() {
  // State management for the import workflow
  const [step, setStep] = useState(1);
  const [importData, setImportData] = useState({
    provider: null,
    importTypes: [],
    files: {},
    parseResults: {}
  });
  const [transformedData, setTransformedData] = useState({});
  const [currentImportType, setCurrentImportType] = useState(null);
  const [importQueue, setImportQueue] = useState([]);
  const [validationStatus, setValidationStatus] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Handle provider detection completion
  const handleProviderDetected = (data) => {
    setImportData(data);
    
    // Create a queue of import types to process
    const queue = data.importTypes;
    setImportQueue(queue);
    
    // Set the first import type as current
    if (queue.length > 0) {
      setCurrentImportType(queue[0]);
    }
    
    // Move to the transformation step
    setStep(2);
  };
  
  // Handle data transformation completion
  const handleTransformComplete = (transformedTypeData) => {
    // Store the transformed data
    setTransformedData(prev => ({
      ...prev,
      ...transformedTypeData
    }));
    
    // Move to the data editor step
    setStep(3);
  };
  
  // Handle transformation error
  const handleTransformError = (error) => {
    console.error('Transformation error:', error);
    
    // Show error message to user
    alert(`Error during transformation: ${error.message}`);
  };
  
  // Handle data update from editor
  const handleDataUpdate = (updatedData) => {
    setTransformedData(updatedData);
  };
  
  // Move to the validation step
  const handleContinueToValidation = () => {
    setStep(4);
  };
  
  // Handle validation status update
  const handleValidationUpdate = (status, notes) => {
    setValidationStatus(prev => ({
      ...prev,
      [currentImportType]: status
    }));
    
    // Store validation notes if needed
    // ...
  };
  
  // Handle completion of current import type
  const handleImportTypeComplete = () => {
    // Mark current import type as processed
    const currentIndex = importQueue.indexOf(currentImportType);
    
    // Check if there are more import types to process
    if (currentIndex < importQueue.length - 1) {
      // Move to the next import type
      setCurrentImportType(importQueue[currentIndex + 1]);
      
      // Go back to the transformation step for the next type
      setStep(2);
    } else {
      // All import types processed, move to summary
      setStep(5);
    }
  };
  
  // Handle export of all data
  const handleExportAll = (data) => {
    // In a real implementation, this would create a ZIP file with all CSVs
    console.log('Exporting all data:', data);
    
    // For now, just alert the user
    alert('Export functionality would be implemented in the production version.');
  };
  
  // Reset the import process
  const handleReset = () => {
    setStep(1);
    setImportData({
      provider: null,
      importTypes: [],
      files: {},
      parseResults: {}
    });
    setTransformedData({});
    setCurrentImportType(null);
    setImportQueue([]);
    setValidationStatus({});
    setValidationErrors([]);
  };
  
  // Get current step name
  const getStepName = () => {
    switch (step) {
      case 1: return 'Provider Detection';
      case 2: return 'Data Transformation';
      case 3: return 'Data Editing';
      case 4: return 'Validation';
      case 5: return 'Import Summary';
      default: return '';
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ProviderDetection 
            onComplete={handleProviderDetected} 
          />
        );
      case 2:
        return (
          <TransformationEngine 
            provider={importData.provider}
            importType={currentImportType}
            files={importData.files}
            parseResults={importData.parseResults}
            onComplete={handleTransformComplete}
            onError={handleTransformError}
          />
        );
      case 3:
        return (
          <DataEditor 
            provider={importData.provider}
            importType={currentImportType}
            transformedData={transformedData}
            validationErrors={validationErrors}
            onUpdate={handleDataUpdate}
            onContinue={handleContinueToValidation}
          />
        );
      case 4:
        return (
          <ValidationChecklist 
            provider={importData.provider}
            importType={currentImportType}
            transformedData={transformedData}
            validationStatus={validationStatus}
            onValidate={handleValidationUpdate}
            onContinue={handleImportTypeComplete}
          />
        );
      case 5:
        return (
          <ImportSummary 
            provider={importData.provider}
            importTypes={importQueue}
            transformedData={transformedData}
            validationStatus={validationStatus}
            onExport={handleExportAll}
            onReset={handleReset}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Approach CSV Import Tool</h1>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">{getStepName()}</h2>
            <span className="text-sm text-gray-500">
              Step {step} of 5
              {currentImportType && ` - Processing ${currentImportType}`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
          
          {/* Import type indicators */}
          {importQueue.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {importQueue.map((type, index) => (
                <div 
                  key={type}
                  className={`text-xs px-2 py-1 rounded-full ${
                    type === currentImportType 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : index < importQueue.indexOf(currentImportType)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Main content */}
        <main>
          {renderStep()}
        </main>
      </div>
    </div>
  );
}

export default App;
