import React, { useState, useEffect } from 'react';

const ValidationChecklist = ({ 
  provider, 
  importType, 
  transformedData,
  validationStatus,
  onValidate,
  onContinue 
}) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [notes, setNotes] = useState({});
  
  // Define validation checklist items for each import type
  const validationChecklists = {
    // RGP validation checklists
    RGP: {
      customers: [
        { 
          id: 'phones', 
          text: 'Double-check that all phone numbers are complete and accurate.',
          hint: 'Are phone numbers in the correct format and do they match the source data?' 
        },
        { 
          id: 'emails', 
          text: 'Make sure all email addresses are correct.',
          hint: "There's no distinction between primary and secondary emails. If duplicates are found, they'll be moved to secondary. Clients can update their email upon first login." 
        },
        { 
          id: 'barcodes', 
          text: "Review the barcodes to ensure they're correct.",
          hint: 'Just a heads-up — leading zeros might have been removed due to the CSV format.' 
        }
      ],
      memberships: [
        { 
          id: 'mapping', 
          text: 'Ensure that the memberships to be mapped are complete.',
          hint: 'If any are missing, check the reason for the exclusion (usually due to cancellations or expirations).' 
        },
        { 
          id: 'mappingSecondImport', 
          text: 'For the second import, revise again that each membership has been properly mapped.',
          hint: 'If there are new memberships, please notify the team.' 
        },
        { 
          id: 'customers', 
          text: 'Ensure that customers have their memberships properly identified.' 
        },
        { 
          id: 'prices', 
          text: 'Verify that the prices are correct.',
          hint: 'If a client is mapped to a membership, that membership can include multiple price options.' 
        },
        { 
          id: 'endDates', 
          text: 'Verify that the End Dates are correct.' 
        },
        { 
          id: 'duration', 
          text: 'Verify that the duration of the membership is correct (Monthly, Yearly).' 
        },
        { 
          id: 'billDates', 
          text: 'Ensure that the Next Bill Dates are specified for the date they consider appropriate.' 
        },
        { 
          id: 'holds', 
          text: 'Review to ensure that the memberships on hold are correctly identified.' 
        },
        { 
          id: 'newMemberships', 
          text: 'Have new memberships been added between the first and the second import?' 
        }
      ],
      certifications: [
        { 
          id: 'types', 
          text: 'Ensure that the types of certifications are correct for mapping.' 
        },
        { 
          id: 'dates', 
          text: 'Verify certification start and end dates.',
          hint: 'The client must provide the Startdate and Enddate of the certification. This could be optional for the client.' 
        }
      ],
      waivers: [
        { 
          id: 'expiration', 
          text: 'Provide the expiration date of the waivers.',
          hint: "Don't give them an option NOT to choose an expiration date. It protects the gym from liability." 
        }
      ],
      passes: [
        { 
          id: 'passTypes', 
          text: 'Ensure that the passes are associated with their corresponding pass type.' 
        },
        { 
          id: 'customers', 
          text: 'Ensure that customers have their passes properly identified.' 
        },
        { 
          id: 'mboTypes', 
          text: 'In the case of MB, verify that the pass types are included in the mapping.' 
        },
        { 
          id: 'quantity', 
          text: 'Verify that the Quantity column is correct.',
          hint: 'Explain that the quantity may be higher than expected if those customers have checked-in recently.' 
        }
      ],
      households: [
        { 
          id: 'associations', 
          text: 'Ensure that each customer is correctly associated with their family.' 
        }
      ],
      products: [
        { 
          id: 'inStore', 
          text: 'Confirm that only physical in-store products are imported.',
          hint: 'Only retail items such as food, shoes for rent, drinks, etc. should be included.' 
        },
        { 
          id: 'revenueCategories', 
          text: 'Ensure that all types of revenue categories are included in the mapping.' 
        },
        { 
          id: 'prices', 
          text: 'Verify that the prices of those revenue categories are correct.' 
        },
        { 
          id: 'active', 
          text: 'Verify whether or not that product is supposed to be active on import.' 
        },
        { 
          id: 'noVariants', 
          text: 'We are unable to import variants or inventory.' 
        }
      ],
      giftCards: [
        { 
          id: 'amounts', 
          text: 'Ensure that the amounts for each giftcard is correct.' 
        }
      ],
      storeCredit: [
        { 
          id: 'amounts', 
          text: 'Ensure that the amounts for each customer are correct.' 
        }
      ]
    },
    
    // MBO validation checklists
    MBO: {
      customers: [
        { 
          id: 'phones', 
          text: 'Double-check that all phone numbers are complete and accurate.' 
        },
        { 
          id: 'emails', 
          text: 'Make sure all email addresses are correct.',
          hint: "There\'s no distinction between primary and secondary emails. If duplicates are found, they'll be moved to secondary." 
        },
        { 
          id: 'barcodes', 
          text: 'Review the barcodes to ensure they\'re correct.',
          hint: 'Just a heads-up — leading zeros might have been removed due to the CSV format.' 
        }
      ],
      memberships: [
        { 
          id: 'mapping', 
          text: 'Ensure that the memberships to be mapped are complete.' 
        },
        { 
          id: 'customers', 
          text: 'Ensure that customers have their memberships properly identified.' 
        },
        { 
          id: 'prices', 
          text: 'Verify that the prices are correct.' 
        },
        { 
          id: 'endDates', 
          text: 'Verify that the End Dates are correct.' 
        },
        { 
          id: 'duration', 
          text: 'Verify that the duration of the membership is correct (Monthly, Yearly).' 
        },
        { 
          id: 'billDates', 
          text: 'Ensure that the Next Bill Dates are specified for the appropriate date.' 
        },
        { 
          id: 'holds', 
          text: 'Review to ensure that the memberships on hold are correctly identified.' 
        }
      ],
      certifications: [
        { 
          id: 'types', 
          text: 'Ensure that the types of certifications are correct for mapping.' 
        },
        { 
          id: 'dates', 
          text: 'Verify the start and end dates of certifications.' 
        }
      ],
      waivers: [
        { 
          id: 'expiration', 
          text: 'Provide the expiration date of the waivers.',
          hint: 'This protects the gym from liability.' 
        }
      ],
      passes: [
        { 
          id: 'passTypes', 
          text: 'Ensure that the passes are associated with their corresponding pass type.' 
        },
        { 
          id: 'customers', 
          text: 'Ensure that customers have their passes properly identified.' 
        },
        { 
          id: 'passMapping', 
          text: 'Verify that the pass types are included in the mapping.' 
        },
        { 
          id: 'quantity', 
          text: 'Verify that the Quantity column is correct.' 
        }
      ],
      households: [
        { 
          id: 'associations', 
          text: 'Ensure that each customer is correctly associated with their family.' 
        }
      ],
      giftCards: [
        { 
          id: 'amounts', 
          text: 'Ensure that the amounts for each giftcard is correct.' 
        }
      ],
      storeCredit: [
        { 
          id: 'amounts', 
          text: 'Ensure that the amounts for each customer are correct.' 
        }
      ]
    },
    
    // Default checklist for "Other" provider
    Other: {
      customers: [
        { 
          id: 'data', 
          text: 'Verify that all customer data has been imported correctly.' 
        },
        { 
          id: 'duplicates', 
          text: 'Check for any duplicate records and address them.' 
        },
        { 
          id: 'required', 
          text: 'Ensure all required fields have valid values.' 
        }
      ],
      memberships: [
        { 
          id: 'data', 
          text: 'Verify that all membership data has been imported correctly.' 
        },
        { 
          id: 'mapping', 
          text: 'Confirm that membership types are correctly mapped.' 
        },
        { 
          id: 'customers', 
          text: 'Verify that memberships are correctly associated with customers.' 
        }
      ]
      // Other import types would have similar generic checklists
    }
  };
  
  // Get checklist items for current provider and import type
  const getChecklistItems = () => {
    // First try provider-specific checklist
    const providerList = validationChecklists[provider]?.[importType];
    if (providerList) {
      return providerList;
    }
    
    // Fallback to Other provider's list
    return validationChecklists['Other'][importType] || [];
  };
  
  const checklistItems = getChecklistItems();
  
  // Initialize checked state when checklist items change
  useEffect(() => {
    if (checklistItems && checklistItems.length > 0) {
      // Get from localStorage if available
      const savedChecks = localStorage.getItem(`validation_${provider}_${importType}`);
      const savedNotes = localStorage.getItem(`notes_${provider}_${importType}`);
      
      if (savedChecks) {
        setCheckedItems(JSON.parse(savedChecks));
      } else {
        // Initialize all as unchecked
        const initialChecked = {};
        checklistItems.forEach(item => {
          initialChecked[item.id] = false;
        });
        setCheckedItems(initialChecked);
      }
      
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, [provider, importType, checklistItems]);
  
  // Save checked state to localStorage when it changes
  useEffect(() => {
    if (Object.keys(checkedItems).length > 0) {
      localStorage.setItem(`validation_${provider}_${importType}`, JSON.stringify(checkedItems));
    }
  }, [checkedItems, provider, importType]);
  
  // Save notes to localStorage when they change
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem(`notes_${provider}_${importType}`, JSON.stringify(notes));
    }
  }, [notes, provider, importType]);
  
  // Handle checkbox change
  const handleCheckChange = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle note change
  const handleNoteChange = (id, value) => {
    setNotes(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Check if all items are checked
  const allChecked = checklistItems.every(item => checkedItems[item.id]);
  
  // Group similar items
  const groupedItems = checklistItems.reduce((groups, item) => {
    // Extract a group name from the item id
    // For example, if id is "phones", "emails", "mapping", the group is the id itself
    const group = item.id;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
  
  // Format the item count for display
  const formatItemCount = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    return `${checkedCount} of ${checklistItems.length} items verified`;
  };
  
  // Get sample data for display
  const getSampleData = () => {
    if (!transformedData || !transformedData[importType] || transformedData[importType].length === 0) {
      return [];
    }
    
    // Get 5 random samples
    const allData = transformedData[importType];
    const sampleSize = Math.min(5, allData.length);
    const samples = [];
    
    // Use a set to ensure we don't get duplicates
    const selectedIndices = new Set();
    
    while (selectedIndices.size < sampleSize) {
      const randomIndex = Math.floor(Math.random() * allData.length);
      selectedIndices.add(randomIndex);
    }
    
    // Convert set to array and get the samples
    return Array.from(selectedIndices).map(index => allData[index]);
  };
  
  // Get display fields based on import type
  const getDisplayFields = () => {
    switch (importType) {
      case 'customers':
        return ['firstName', 'lastName', 'email', 'mobile', 'birthdate'];
      case 'memberships':
        return ['membershipTypeId', 'startEffectiveDate', 'endEffectiveDate', 'price', 'nextBillDate'];
      case 'passes':
        return ['passTypeId', 'quantity', 'startEffectiveDate'];
      case 'waivers':
        return ['signedDT', 'startEffectiveDT', 'endEffectiveDT'];
      case 'giftCards':
        return ['amount', 'balance'];
      case 'certifications':
        return ['certificationId', 'startEffectiveDate', 'endEffectiveDate'];
      case 'households':
        return ['customerId', 'parentCustomerId'];
      case 'products':
        return ['name', 'price', 'manufacturer', 'revenueCategoryId'];
      default: 
        return []; // Return an empty array or some default fields
}
