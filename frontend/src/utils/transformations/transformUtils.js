import { v4 as uuidv4 } from 'uuid';

/**
 * Utility functions for data transformations
 */

// Format date string from RGP format to ISO
export const formatRgpDate = (dateString) => {
  if (!dateString) return null;
  
  // If it's already a date object, format it
  if (dateString instanceof Date) {
    return dateString.toISOString();
  }
  
  // Check if it's a date string with time component
  if (dateString.includes(':')) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  // Check for MM/DD/YYYY format
  const dateParts = dateString.split('/');
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[0]) - 1) {
        // Single email, keep it as is and clear secondary
        row.secondaryEmail = null;
      }
    }
  });
  
  return processedData;
};

// Handle duplicate barcodes in a dataset
export const handleDuplicateBarcodes = (data) => {
  // Create a copy of the data
  const processedData = [...data];
  
  // Find duplicate barcodes
  const barcodeCounts = {};
  processedData.forEach(row => {
    if (row.barcodeId) {
      barcodeCounts[row.barcodeId] = (barcodeCounts[row.barcodeId] || 0) + 1;
    }
  });
  
  // Null duplicate barcodes
  processedData.forEach(row => {
    if (row.barcodeId && barcodeCounts[row.barcodeId] > 1) {
      row.barcodeId = null;
    }
  });
  
  return processedData;
};

// Validate required fields
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (row[field] === null || row[field] === undefined || row[field] === '') {
        errors.push({
          rowIndex: index,
          field,
          message: `${field} is required`
        });
      }
    });
  });
  
  return errors;
};

// Validate email format
export const validateEmailFormat = (data) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  data.forEach((row, index) => {
    if (row.email && !emailRegex.test(row.email)) {
      errors.push({
        rowIndex: index,
        field: 'email',
        message: 'Invalid email format'
      });
    }
    
    if (row.secondaryEmail && !emailRegex.test(row.secondaryEmail)) {
      errors.push({
        rowIndex: index,
        field: 'secondaryEmail',
        message: 'Invalid email format'
      });
    }
  });
  
  return errors;
};

// Validate date format
export const validateDateFormat = (data, dateFields) => {
  const errors = [];
  
  data.forEach((row, index) => {
    dateFields.forEach(field => {
      if (row[field]) {
        try {
          // Try to parse the date
          const date = new Date(row[field]);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (e) {
          errors.push({
            rowIndex: index,
            field,
            message: 'Invalid date format'
          });
        }
      }
    });
  });
  
  return errors;
};

// Validate numeric fields
export const validateNumericFields = (data, numericFields) => {
  const errors = [];
  
  data.forEach((row, index) => {
    numericFields.forEach(field => {
      if (row[field] !== null && row[field] !== undefined) {
        if (isNaN(parseFloat(row[field])) || !isFinite(row[field])) {
          errors.push({
            rowIndex: index,
            field,
            message: 'Must be a number'
          });
        }
      }
    });
  });
  
  return errors;
};

// Validate relationships between datasets
export const validateRelationships = (parentData, childData, parentKey, childKey) => {
  const errors = [];
  
  // Create a set of valid parent keys
  const validParentKeys = new Set();
  parentData.forEach(row => {
    if (row[parentKey]) {
      validParentKeys.add(row[parentKey]);
    }
  });
  
  // Validate child references
  childData.forEach((row, index) => {
    if (row[childKey] && !validParentKeys.has(row[childKey])) {
      errors.push({
        rowIndex: index,
        field: childKey,
        message: `References non-existent ${parentKey}`
      });
    }
  });
  
  return errors;
};

// Format membership price
export const formatMembershipPrice = (price) => {
  if (!price) return null;
  
  // Remove currency symbol if present
  if (typeof price === 'string') {
    price = price.replace(/[$£€]/, '').trim();
  }
  
  // Convert to number
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return null;
  
  return numPrice;
};

// Calculate next bill date
export const calculateNextBillDate = (startDate, billingType, customDay = null) => {
  if (!startDate) return null;
  
  const date = new Date(startDate);
  if (isNaN(date.getTime())) return null;
  
  // For monthly billing
  if (billingType?.toUpperCase() === 'MONTHLY') {
    // If custom day provided, use it
    if (customDay && customDay > 0 && customDay <= 31) {
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      
      // Create new date with custom day
      const nextDate = new Date(currentYear, currentMonth + 1, customDay);
      
      // If day is invalid (e.g., Feb 31), it will roll over to the next month
      // Check and adjust if needed
      if (nextDate.getMonth() !== (currentMonth + 1) % 12) {
        // Use last day of target month
        nextDate.setDate(0);
      }
      
      return nextDate.toISOString();
    }
    
    // Otherwise, use same day next month
    date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  }
  
  // For yearly billing
  if (billingType?.toUpperCase() === 'YEARLY') {
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  }
  
  // For weekly billing
  if (billingType?.toUpperCase() === 'WEEKLY') {
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }
  
  // Default case
  return null;
};

// Export utility functions
export default {
  formatRgpDate,
  formatMboDate,
  calculateDaysBetween,
  formatPhoneNumber,
  createExternalId,
  handleDuplicateEmails,
  handleDuplicateBarcodes,
  validateRequiredFields,
  validateEmailFormat,
  validateDateFormat,
  validateNumericFields,
  validateRelationships,
  formatMembershipPrice,
  calculateNextBillDate
};; // JS months are 0-indexed
    const day = parseInt(dateParts[1]);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  // Default fallback
  return null;
};

// Format date string from MBO format to ISO
export const formatMboDate = (dateString) => {
  if (!dateString) return null;
  
  // If it's already a date object, format it
  if (dateString instanceof Date) {
    return dateString.toISOString();
  }
  
  // Special case for "Contract Completed"
  if (dateString === 'Contract Completed') {
    return null;
  }
  
  // Try to parse directly first
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  // Check for "Month DD YYYY" format (e.g. "January 15 2023")
  const monthNameRegex = /^([a-zA-Z]+)\s+(\d{1,2})\s+(\d{4})$/;
  const monthNameMatch = dateString.match(monthNameRegex);
  if (monthNameMatch) {
    const months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    
    const month = months[monthNameMatch[1].toLowerCase()];
    const day = parseInt(monthNameMatch[2]);
    const year = parseInt(monthNameMatch[3]);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  // Check for MM/DD/YYYY format
  const dateParts = dateString.split('/');
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
    const day = parseInt(dateParts[1]);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  // Try YYYY-MM-DD format
  const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = dateString.match(isoDateRegex);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const month = parseInt(isoMatch[2]) - 1;
    const day = parseInt(isoMatch[3]);
    
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  
  // Default fallback
  return null;
};

// Calculate days between two dates
export const calculateDaysBetween = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  
  const startDate = new Date(formatRgpDate(startDateStr) || new Date());
  const endDate = new Date(formatRgpDate(endDateStr) || new Date());
  
  const differenceInTime = endDate.getTime() - startDate.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  return differenceInDays > 0 ? differenceInDays : 0;
};

// Format phone number to E.164 format
export const formatPhoneNumber = (phoneString) => {
  if (!phoneString) return null;
  
  // Remove any non-numeric characters
  const digits = phoneString.replace(/\D/g, '');
  
  // Check for valid US number (10 or 11 digits)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // For non-US numbers, use as is if valid
  if (digits.length >= 8) {
    return `+${digits}`;
  }
  
  return null;
};

// Create unique external ID
export const createExternalId = (id, locationName) => {
  if (!id) return uuidv4();
  return `${id}_${locationName}`;
};

// Handle duplicate emails in a dataset
export const handleDuplicateEmails = (data) => {
  // Create a copy of the data
  const processedData = [...data];
  
  // Find duplicate emails
  const emailCounts = {};
  processedData.forEach(row => {
    if (row.email) {
      const email = row.email.toLowerCase().trim();
      emailCounts[email] = (emailCounts[email] || 0) + 1;
    }
  });
  
  // Process duplicates
  processedData.forEach(row => {
    if (row.email) {
      const email = row.email.toLowerCase().trim();
      if (emailCounts[email] > 1) {
        // Move duplicates to secondary email
        row.secondaryEmail = row.email;
        row.email = null;
      } else if (emailCounts[email] ===
