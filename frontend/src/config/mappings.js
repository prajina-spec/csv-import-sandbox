export const FIELD_MAPPINGS = {
  customers: [
    { 
      sourceField: 'firstname', 
      targetField: 'firstName', 
      required: true,
      description: 'Customer\'s first name',
      validations: [
        { rule: 'required', message: 'First name is required' },
      ]
    },
    { 
      sourceField: 'lastname', 
      targetField: 'lastName', 
      required: true,
      description: 'Customer\'s last name',
      validations: [
        { rule: 'required', message: 'Last name is required' },
      ]
    },
    { 
      sourceField: 'email', 
      targetField: 'email', 
      required: true,
      description: 'Primary email address for communication',
      validations: [
        { rule: 'required', message: 'Email is required' },
        { rule: 'email', message: 'Must be a valid email address' }
      ]
    },
    { 
      sourceField: 'address1', 
      targetField: 'address1', 
      required: false,
      description: 'Street address, line 1'
    },
    { 
      sourceField: 'address2', 
      targetField: 'address2', 
      required: false,
      description: 'Street address, line 2 (apt, suite, etc.)'
    },
    { 
      sourceField: 'city', 
      targetField: 'city', 
      required: false,
      description: 'City name'
    },
    { 
      sourceField: 'state', 
      targetField: 'state', 
      required: false,
      description: 'State or province'
    },
    { 
      sourceField: 'zip', 
      targetField: 'postalCode', 
      required: false,
      description: 'ZIP or postal code'
    },
    { 
      sourceField: 'cell_phone', 
      targetField: 'mobile', 
      required: false,
      description: 'Mobile phone number',
      validations: [
        { rule: 'phone', message: 'Must be a valid phone number' }
      ]
    },
    { 
      sourceField: 'bday', 
      targetField: 'birthdate', 
      required: false,
      description: 'Date of birth (YYYY-MM-DD)',
      normalize: 'date'
    },
    { 
      sourceField: 'emergency_contact', 
      targetField: 'emergencyName', 
      required: false,
      description: 'Emergency contact person name'
    },
    { 
      sourceField: 'emergency_phone', 
      targetField: 'emergencyNumber', 
      required: false,
      description: 'Emergency contact phone number'
    },
    { 
      sourceField: 'country', 
      targetField: 'country', 
      required: false,
      description: 'Country name'
    },
    { 
      sourceField: 'barcode', 
      targetField: 'barcodeId', 
      required: false,
      description: 'Barcode ID for membership card'
    },
    { 
      sourceField: 'customer_id', 
      targetField: 'externalId', 
      required: true,
      description: 'Unique customer ID from previous system',
      validations: [
        { rule: 'required', message: 'Customer ID is required' },
        { rule: 'unique', message: 'Customer ID must be unique' }
      ]
    }
  ],
  memberships: [
    { 
      sourceField: 'CUSTOMER_ID', 
      targetField: 'customerId', 
      required: true,
      description: 'The unique customer ID this membership belongs to',
      validations: [
        { rule: 'required', message: 'Customer ID is required' },
        { rule: 'existsInSystem', message: 'Customer ID must exist in the system' }
      ]
    },
    { 
      sourceField: 'MEMBERSHIP_START_DATE', 
      targetField: 'startDate', 
      required: true,
      description: 'Date when membership begins (YYYY-MM-DD)',
      normalize: 'date',
      validations: [
        { rule: 'required', message: 'Start date is required' },
        { rule: 'date', message: 'Must be a valid date' }
      ]
    },
    { 
      sourceField: 'MEMBERSHIP_EXP_DATE', 
      targetField: 'endDate', 
      required: false,
      description: 'Date when membership expires (YYYY-MM-DD)',
      normalize: 'date',
      validations: [
        { rule: 'date', message: 'Must be a valid date' },
        { rule: 'afterField:startDate', message: 'End date must be after start date' }
      ]
    },
    { 
      sourceField: 'MEMBERSHIP_FORM_OF_PAYMENT', 
      targetField: 'paymentMethod', 
      required: true,
      description: 'How the customer pays for the membership',
      validations: [
        { rule: 'required', message: 'Payment method is required' },
        { rule: 'oneOf:card,cash,ach,check', message: 'Must be a valid payment method' }
      ]
    },
    { 
      sourceField: 'current_status', 
      targetField: 'status', 
      required: true,
      description: 'Current status of the membership',
      validations: [
        { rule: 'required', message: 'Status is required' },
        { rule: 'oneOf:active,expired,cancelled,pending', message: 'Must be a valid status' }
      ]
    },
    { 
      sourceField: 'EFT_DUES_AMOUNT', 
      targetField: 'price', 
      required: true,
      description: 'Monthly payment amount',
      normalize: 'currency',
      validations: [
        { rule: 'required', message: 'Price is required' },
        { rule: 'number', message: 'Must be a valid number' },
        { rule: 'min:0', message: 'Price cannot be negative' }
      ]
    }
  ]
};

// Data validators and normalizers
export const validators = {
  required: (value) => value !== undefined && value !== null && value !== '',
  email: (value) => !value || /\S+@\S+\.\S+/.test(value),
  phone: (value) => !value || /^[0-9()-.\s]+$/.test(value),
  date: (value) => !value || !isNaN(Date.parse(value)),
  number: (value) => !value || !isNaN(parseFloat(value)),
  min: (min) => (value) => !value || parseFloat(value) >= min,
  oneOf: (options) => (value) => !value || options.split(',').includes(value),
  afterField: (field) => (value, allValues) => {
    if (!value || !allValues[field]) return true;
    return new Date(value) > new Date(allValues[field]);
  },
  unique: (value, allValues, fieldName, allRows) => {
    if (!value) return true;
    return allRows.filter(row => row[fieldName] === value).length === 1;
  }
};

// Data normalizers to transform input
export const normalizers = {
  date: (value) => {
    if (!value) return value;
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (e) {
      return value;
    }
  },
  currency: (value) => {
    if (!value) return value;
    const num = parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? value : num.toFixed(2);
  },
  phone: (value) => {
    if (!value) return value;
    // Remove non-numeric characters except + for country code
    return value.toString().replace(/[^\d+]/g, '');
  }
};
