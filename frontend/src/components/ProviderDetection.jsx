import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

// File type detection helper
const detectFileType = (files) => {
  // Check if files match MBO patterns
  const mboPatterns = [
    { pattern: /Client.*\.csv/i, type: 'clients' },
    { pattern: /AccountBalances.*\.csv/i, type: 'accountBalances' },
    { pattern: /GiftCardsBalances.*\.csv/i, type: 'giftCards' },
    { pattern: /ClientAutopayContract.*\.csv/i, type: 'autopayContracts' },
    { pattern: /ClientPricingOptions.*\.csv/i, type: 'pricingOptions' },
    { pattern: /Visits.*\.csv/i, type: 'visits' },
    { pattern: /ClientRelationships.*\.csv/i, type: 'relationships' },
    { pattern: /Notes.*\.csv/i, type: 'notes' }
  ];

  // Check if files match RGP patterns
  const rgpPatterns = [
    { pattern: /Customer.*\.csv/i, type: 'customers' },
    { pattern: /Gift Cards Balances.*\.csv/i, type: 'giftCards' },
    { pattern: /Products.*\.csv/i, type: 'products' },
    { pattern: /Web Aliases.*\.csv/i, type: 'webAliases' },
    { pattern: /Punches.*\.csv/i, type: 'punches' },
    { pattern: /Vendors.*\.csv/i, type: 'vendors' }
  ];

  // Count matches for each provider
  let mboMatches = 0;
  let rgpMatches = 0;

  for (const file of files) {
    // Check MBO patterns
    const isMboMatch = mboPatterns.some(pattern => pattern.pattern.test(file.name));
    if (isMboMatch) mboMatches++;

    // Check RGP patterns
    const isRgpMatch = rgpPatterns.some(pattern => pattern.pattern.test(file.name));
    if (isRgpMatch) rgpMatches++;
  }

  // Determine provider based on matches
  if (mboMatches > rgpMatches && mboMatches >= 2) {
    return 'MBO';
  } else if (rgpMatches > mboMatches && rgpMatches >= 2) {
    return 'RGP';
  } else {
    // Additional content analysis if filenames are not sufficient
    return analyzeFileContents(files);
  }
};

// More detailed content analysis
const analyzeFileContents = async (files) => {
  // Look for characteristic columns or patterns in the files
  
  // For demonstration, we'll check the first few rows of each file
  for (const file of files) {
    if (file.type === 'text/csv') {
      try {
        const text = await readFileAsync(file);
        
        // Check for MBO indicators
        if (text.includes('MBSystemID') || 
            text.includes('ClientContractID') || 
            text.includes('Client ID')) {
          return 'MBO';
        }
        
        // Check for RGP indicators
        if (text.includes('CUSTOMER_ID') || 
            text.includes('FACILITY_WAIVER_DATE') || 
            text.includes('BELAY_CERTIFIED')) {
          return 'RGP';
        }
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  }
  
  // If we can't determine, default to "Other"
  return 'Other';
};

// Helper to read file as text
const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Required file checklist based on provider and selected import types
const getRequiredFiles = (provider, importTypes) => {
  if (provider === 'RGP') {
    const fileRequirements = {
      customers: [{ name: 'Customer.csv', required: true }],
      memberships: [{ name: 'Customer.csv', required: true }],
      passes: [{ name: 'Punches.csv', required: true }],
      waivers: [{ name: 'Customer.csv', required: true }],
      giftCards: [{ name: 'Gift Cards Balances.csv', required: true }],
      products: [
        { name: 'Products.csv', required: true },
        { name: 'Vendors.csv', required: false }
      ]
    };
    
    // Build list of required files based on selected import types
    const requiredFiles = [];
    importTypes.forEach(type => {
      if (fileRequirements[type]) {
        fileRequirements[type].forEach(file => {
          if (!requiredFiles.some(f => f.name === file.name)) {
            requiredFiles.push(file);
          }
        });
      }
    });
    
    return requiredFiles;
  } else if (provider === 'MBO') {
    const fileRequirements = {
      customers: [{ name: 'Clients.csv', required: true }],
      memberships: [
        { name: 'ClientAutopayContracts.csv', required: true },
        { name: 'ClientPricingOptions.csv', required: true }
      ],
      passes: [{ name: 'Visits Remaining Report.csv', required: true }],
      waivers: [{ name: '_Documents.zip', required: true }],
      giftCards: [{ name: 'GiftCardsBalances.csv', required: true }],
      storeCredit: [{ name: 'AccountBalances.csv', required: true }],
      relationships: [{ name: 'ClientRelationships.csv', required: true }],
      notes: [{ name: 'Notes.csv', required: false }]
    };
    
    // Build list of required files
    const requiredFiles = [];
    importTypes.forEach(type => {
      if (fileRequirements[type]) {
        fileRequirements[type].forEach(file => {
          if (!requiredFiles.some(f => f.name === file.name)) {
            requiredFiles.push(file);
          }
        });
      }
    });
    
    return requiredFiles;
  } else {
    // Generic requirements for "Other" provider
    return [
      { name: 'Customers.csv', required: true },
      { name: 'Memberships.csv', required: importTypes.includes('memberships') },
      { name: 'Passes.csv', required: importTypes.includes('passes') },
      { name: 'Waivers.csv', required: importTypes.includes('waivers') }
    ];
  }
};

const ProviderDetection = ({ onComplete }) => {
  const [files, setFiles] = useState([]);
  const [provider, setProvider] = useState(null);
  const [detectionInProgress, setDetectionInProgress] = useState(false);
  const [importTypes, setImportTypes] = useState([]);
  const [requiredFiles, setRequiredFiles] = useState([]);
  const [uploads, setUploads] = useState({});
  const [parseResults, setParseResults] = useState({});
  
  // Define import type options
  const importTypeOptions = [
    { id: 'customers', label: 'Customers', required: true },
    { id: 'memberships', label: 'Memberships' },
    { id: 'passes', label: 'Passes' },
    { id: 'waivers', label: 'Waivers' },
    { id: 'giftCards', label: 'Gift Cards' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'products', label: 'Products' },
    { id: 'households', label: 'Households' }
  ];
  
  // Add MBO-specific import types
  const mboSpecificOptions = [
    { id: 'storeCredit', label: 'Store Credit' },
    { id: 'notes', label: 'Customer Notes' },
    { id: 'sharedMemberships', label: 'Shared Memberships' }
  ];
  
  const allImportOptions = provider === 'MBO' 
    ? [...importTypeOptions, ...mboSpecificOptions]
    : importTypeOptions;

  // Handle file drop
  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
    setDetectionInProgress(true);
    
    // Detect provider from files
    const detectedProvider = detectFileType(acceptedFiles);
    setProvider(detectedProvider);
    
    // Initialize with default import types (always include customers)
    const defaultTypes = ['customers'];
    setImportTypes(defaultTypes);
    
    // Set required files based on default import types
    setRequiredFiles(getRequiredFiles(detectedProvider, defaultTypes));
    
    setDetectionInProgress(false);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true,
    accept: {
      'text/csv': ['.csv'],
      'application/zip': ['.zip']
    }
  });

  // Handle import type selection
  const handleImportTypeChange = (e) => {
    const type = e.target.value;
    
    setImportTypes(prev => {
      // If already selected, remove it (except customers which is required)
      if (prev.includes(type) && type !== 'customers') {
        const newTypes = prev.filter(t => t !== type);
        setRequiredFiles(getRequiredFiles(provider, newTypes));
        return newTypes;
      } 
      // Otherwise add it
      else if (!prev.includes(type)) {
        const newTypes = [...prev, type];
        setRequiredFiles(getRequiredFiles(provider, newTypes));
        return newTypes;
      }
      
      return prev;
    });
  };

  // Handle file upload for a specific requirement
  const handleFileUpload = (e, requirement) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Store the file
    setUploads(prev => ({
      ...prev,
      [requirement.name]: file
    }));
    
    // Parse the CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParseResults(prev => ({
          ...prev,
          [requirement.name]: results
        }));
      }
    });
  };

  // Check if all required files are uploaded
  const allRequiredFilesUploaded = () => {
    return requiredFiles
      .filter(f => f.required)
      .every(f => uploads[f.name]);
  };

  // Continue to next step
  const handleContinue = () => {
    if (allRequiredFilesUploaded()) {
      onComplete({
        provider,
        importTypes,
        files: uploads,
        parseResults
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Import Data</h2>
      
      {!provider ? (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload Your Files</h3>
          <p className="text-gray-600 mb-4">
            Upload your export files from your current system. We'll automatically detect if you're coming from Rock Gym Pro or MindBody Online.
          </p>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-500">Drop the files here...</p>
            ) : (
              <div>
                <p className="mb-2">Drag and drop your CSV files here, or click to select files</p>
                <p className="text-sm text-gray-500">
                  For Rock Gym Pro: Customer.csv, Punches.csv, etc.<br />
                  For MindBody: Clients.csv, ClientAutopayContracts.csv, etc.
                </p>
              </div>
            )}
          </div>
          
          {detectionInProgress && (
            <div className="mt-4 text-center">
              <p className="text-blue-600">Analyzing your files...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Provider Detected: <span className="text-blue-600">{provider}</span>
            </h3>
            <button 
              onClick={() => {
                setProvider(null);
                setFiles([]);
                setImportTypes(['customers']);
                setRequiredFiles([]);
                setUploads({});
                setParseResults({});
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Provider
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">What would you like to import?</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allImportOptions.map(option => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`import-${option.id}`}
                    value={option.id}
                    checked={importTypes.includes(option.id)}
                    onChange={handleImportTypeChange}
                    disabled={option.id === 'customers'} // Customers always required
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor={`import-${option.id}`} className="ml-2 text-sm">
                    {option.label} {option.id === 'customers' && '(Required)'}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Required Files</h4>
            <ul className="space-y-3">
              {requiredFiles.map((requirement, index) => {
                const isUploaded = !!uploads[requirement.name];
                return (
                  <li key={index} className="flex items-center border rounded-lg p-3">
                    <div className="flex-1">
                      <span className={isUploaded ? 'text-green-600' : 'text-gray-700'}>
                        {requirement.name} {requirement.required && <span className="text-red-500">*</span>}
                      </span>
                      {isUploaded && (
                        <span className="ml-2 text-xs text-green-600">
                          (Uploaded - {parseResults[requirement.name]?.data?.length || 0} rows)
                        </span>
                      )}
                    </div>
                    <label className={`px-3 py-1 rounded text-sm cursor-pointer ${
                      isUploaded 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}>
                      {isUploaded ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept=".csv,.zip"
                        onChange={(e) => handleFileUpload(e, requirement)}
                        className="hidden"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!allRequiredFilesUploaded()}
              className={`px-4 py-2 rounded font-medium ${
                allRequiredFilesUploaded()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetection;
