// Value normalization functions
export const normalizeValue = (value, type) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  switch (type) {
    case 'date':
      return normalizeDate(value);
    case 'number':
      return normalizeNumber(value);
    case 'email':
      return normalizeEmail(value);
    case 'phone':
      return normalizePhone(value);
    case 'text':
    default:
      return normalizeText(value);
  }
};

// Normalize date formats (accepts various formats and returns YYYY-MM-DD)
export const normalizeDate = (value) => {
  if (!value) return '';
  
  // Try to parse the date
  const date = new Date(value);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Try common US formats (MM/DD/YYYY or MM-DD-YYYY)
    const parts = value.split(/[-/]/);
    if (parts.length === 3) {
      // Try MM/DD/YYYY format
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // Add 2000 to 2-digit years
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
        return `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
    return value; // Return original if we can't parse it
  }
  
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

// Normalize number formats
export const normalizeNumber = (value) => {
  if (!value) return '';
  
  // Remove non-numeric characters except decimal point
  const cleanValue = value.toString().replace(/[^0-9.]/g, '');
  
  // Check if it's a valid number
  const num = parseFloat(cleanValue);
  return isNaN(num) ? value : num.toString();
};

// Normalize email format
export const normalizeEmail = (value) => {
  if (!value) return '';
  return value.toString().trim().toLowerCase();
};

// Normalize phone numbers
export const normalizePhone = (value) => {
  if (!value) return '';
  
  // Remove non-numeric characters
  const digits = value.toString().replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if it's a 10-digit US number
  if (digits.length === 10) {
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
  }
  
  return digits;
};

// Simple text normalization (trim whitespace)
export const normalizeText = (value) => {
  if (!value) return '';
  return value.toString().trim();
};

// Validation functions
export const validateValue = (value, validations) => {
  if (!validations || !Array.isArray(validations)) {
    return { valid: true };
  }

  for (const validation of validations) {
    const { type, message } = validation;
    
    switch (type) {
      case 'required':
        if (!value || value.trim() === '') {
          return { valid: false, message: message || 'This field is required' };
        }
        break;
      
      case 'email':
        if (value && !validateEmail(value)) {
          return { valid: false, message: message || 'Invalid email format' };
        }
        break;
      
      case 'date':
        if (value && !validateDate(value)) {
          return { valid: false, message: message || 'Invalid date format' };
        }
        break;
      
      case 'phone':
        if (value && !validatePhone(value)) {
          return { valid: false, message: message || 'Invalid phone number' };
        }
        break;
      
      case 'number':
        if (value && !validateNumber(value)) {
          return { valid: false, message: message || 'Must be a number' };
        }
        break;
      
      case 'min':
        if (validation.value !== undefined && parseFloat(value) < validation.value) {
          return { valid: false, message: message || `Value must be at least ${validation.value}` };
        }
        break;
      
      case 'max':
        if (validation.value !== undefined && parseFloat(value) > validation.value) {
          return { valid: false, message: message || `Value must not exceed ${validation.value}` };
        }
        break;
      
      case 'custom':
        if (validation.validator && typeof validation.validator === 'function') {
          const result = validation.validator(value);
          if (!result) {
            return { valid: false, message: message || 'Invalid value' };
          }
        }
        break;
    }
  }

  return { valid: true };
};

// Validate email format
const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Validate date format
const validateDate = (date) => {
  // First try to parse it as a date
  const parsedDate = new Date(date);
  if (!isNaN(parsedDate.getTime())) {
    return true;
  }
  
  // Check common formats
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const usDate = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;
  
  return isoDate.test(date) || usDate.test(date);
};

// Validate phone format
const validatePhone = (phone) => {
  // Remove non-numeric characters for validation
  const digits = phone.replace(/\D/g, '');
  // Basic check: at least 10 digits (US) or 7+ for international
  return digits.length >= 7;
};

// Validate number
const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Data transformation hook
export const applyTransformations = (rows, transformations) => {
  if (!transformations || !Array.isArray(transformations)) {
    return rows;
  }

  return rows.map(row => {
    const newRow = { ...row };
    transformations.forEach(transform => {
      if (typeof transform === 'function') {
        Object.assign(newRow, transform(newRow));
      }
    });
    return newRow;
  });
};
