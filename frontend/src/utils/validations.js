/**
 * Validation utility functions for import data
 */

// Define required fields for each import type
export const requiredFields = {
  customers: ['firstName', 'lastName'],
  memberships: ['status', 'startEffectiveDate', 'membershipTypeId'],
  passes: ['status', 'quantity', 'passTypeId'],
  waivers: ['status', 'startEffectiveDT'],
  giftCards: ['amount', 'balance'],
  certifications: ['certificationId']
};

// Define date fields for validation
export const dateFields = {
  customers: ['birthdate', 'createdAt', 'updatedAt'],
  memberships: ['startEffectiveDate', 'endEffectiveDate', 'nextBillDate', 'holdStartDate', 'holdEndDate', 'createdAt', 'updatedAt'],
  passes: ['startEffectiveDate', 'endEffectiveDate', 'createdAt', 'updatedAt'],
  waivers: ['startEffectiveDT', 'endEffectiveDT', 'signedDT', 'createdAt', 'updatedAt'],
  giftCards: ['createdAt', 'updatedAt'],
  certifications: ['startEffectiveDate', 'endEffectiveDate']
};

// Define numeric fields for validation
export const numericFields = {
  customers: [],
  memberships: ['price', 'discountPercentage', 'discountFlat'],
  passes: ['quantity', 'purchasedQuantity', 'price'],
  waivers: [],
  giftCards: ['amount', 'balance'],
  certifications: []
};

// Validate required fields
export const validateRequired = (data, type) => {
  const errors = [];
  const fields = requiredFields[type] || [];
  
  data.forEach((row, index) => {
    fields.forEach(field => {
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

// Validate date fields
export const validateDates = (data, type) => {
  const errors = [];
  const fields = dateFields[type] || [];
  
  data.forEach((row, index) => {
    fields.forEach(field => {
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
export const validateNumeric = (data, type) => {
  const errors = [];
  const fields = numericFields[type] || [];
  
  data.forEach((row, index) => {
    fields.forEach(field => {
      if (row[field] !== null && row[field] !== undefined && row[field] !== '') {
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

// Validate email format
export const validateEmail = (data) => {
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

// Validate phone number format
export const validatePhone = (data) => {
  const errors = [];
  
  data.forEach((row, index) => {
    if (row.mobile) {
      // Must start with + and have at least 8 digits
      if (!row.mobile.startsWith('+') || !/^\+\d{8,}$/.test(row.mobile)) {
        errors.push({
          rowIndex: index,
          field: 'mobile',
          message: 'Invalid phone format (should be E.164 format)'
        });
      }
    }
  });
  
  return errors;
};

// Validate relationships between datasets
export const validateRelationships = (data, relatedData, localField, foreignField) => {
  const errors = [];
  
  // Create a set of valid foreign keys
  const validForeignKeys = new Set();
  relatedData.forEach(row => {
    if (row[foreignField]) {
      validForeignKeys.add(row[foreignField].toString());
    }
  });
  
  // Validate local references
  data.forEach((row, index) => {
    if (row[localField] && !validForeignKeys.has(row[localField].toString())) {
      errors.push({
        rowIndex: index,
        field: localField,
        message: `References non-existent ${foreignField}`
      });
    }
  });
  
  return errors;
};

// Validate membership data
export const validateMemberships = (data) => {
  const errors = [];
  
  data.forEach((row, index) => {
    // Check if recurring but missing next bill date
    if (row.isRecurring && row.billingType === 'MONTHLY' && !row.nextBillDate) {
      errors.push({
        rowIndex: index,
        field: 'nextBillDate',
        message: 'Recurring membership requires next bill date'
      });
    }
    
    // Check if on hold but missing hold dates
    if (row.status === 'hold' && !row.holdStartDate) {
      errors.push({
        rowIndex: index,
        field: 'holdStartDate',
        message: 'Membership on hold requires hold start date'
      });
    }
    
    // Check if prepaid but missing end date
    if (row.billingType === 'DOP' && !row.endEffectiveDate) {
      errors.push({
        rowIndex: index,
        field: 'endEffectiveDate',
        message: 'Prepaid membership requires end date'
      });
    }
  });
  
  return errors;
};

// Run all validations for a specific import type
export const validateData = (data, type, relatedData = {}) => {
  let errors = [];
  
  // Run basic validations
  errors = errors.concat(validateRequired(data, type));
  errors = errors.concat(validateDates(data, type));
  errors = errors.concat(validateNumeric(data, type));
  
  // Run type-specific validations
  switch (type) {
    case 'customers':
      errors = errors.concat(validateEmail(data));
      errors = errors.concat(validatePhone(data));
      break;
    case 'memberships':
      errors = errors.concat(validateMemberships(data));
      if (relatedData.customers) {
        errors = errors.concat(validateRelationships(data, relatedData.customers, 'customerId', 'id'));
      }
      break;
    case 'passes':
      if (relatedData.customers) {
        errors = errors.concat(validateRelationships(data, relatedData.customers, 'customerId', 'id'));
      }
      break;
    case 'waivers':
      if (relatedData.customers) {
        errors = errors.concat(validateRelationships(data, relatedData.customers, 'customerId', 'id'));
      }
      break;
    case 'giftCards':
      // No additional validations
      break;
    case 'certifications':
      if (relatedData.customers) {
        errors = errors.concat(validateRelationships(data, relatedData.customers, 'customerId', 'id'));
      }
      break;
    default:
      // No additional validations
  }
  
  return errors;
};

export default {
  validateRequired,
  validateDates,
  validateNumeric,
  validateEmail,
  validatePhone,
  validateRelationships,
  validateMemberships,
  validateData
};
