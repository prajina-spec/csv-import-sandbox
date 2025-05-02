export const FIELD_MAPPINGS = {
  customers: [
    { 
      sourceField: 'firstname', 
      targetField: 'firstName', 
      required: true,
      dataType: 'text',
      validations: [
        { type: 'required', message: 'First name is required' }
      ]
    },
    { 
      sourceField: 'lastname', 
      targetField: 'lastName', 
      required: true,
      dataType: 'text',
      validations: [
        { type: 'required', message: 'Last name is required' }
      ]
    },
    { 
      sourceField: 'email', 
      targetField: 'email', 
      required: true,
      dataType: 'email',
      validations: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email format' }
      ]
    },
    { 
      sourceField: 'address1', 
      targetField: 'address1', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'address2', 
      targetField: 'address2', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'city', 
      targetField: 'city', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'state', 
      targetField: 'state', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'zip', 
      targetField: 'postalCode', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'cell_phone', 
      targetField: 'mobile', 
      required: false,
      dataType: 'phone',
      validations: [
        { type: 'phone', message: 'Invalid phone number format' }
      ]
    },
    { 
      sourceField: 'bday', 
      targetField: 'birthdate', 
      required: false,
      dataType: 'date',
      validations: [
        { type: 'date', message: 'Invalid date format' }
      ]
    },
    { 
      sourceField: 'emergency_contact', 
      targetField: 'emergencyName', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'emergency_phone', 
      targetField: 'emergencyNumber', 
      required: false,
      dataType: 'phone',
      validations: [
        { type: 'phone', message: 'Invalid phone number format' }
      ]
    },
    { 
      sourceField: 'country', 
      targetField: 'country', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'barcode', 
      targetField: 'barcodeId', 
      required: false,
      dataType: 'text'
    },
    { 
      sourceField: 'customer_id', 
      targetField: 'externalId', 
      required: true,
      dataType: 'text',
      validations: [
        { type: 'required', message: 'Customer ID is required' }
      ]
    }
  ],
  memberships: [
    { 
      sourceField: 'CUSTOMER_ID', 
      targetField: 'customerId', 
      required: true,
      dataType: 'text',
      validations: [
        { type: 'required', message: 'Customer ID is required' }
      ]
    },
    { 
      sourceField: 'MEMBERSHIP_START_DATE', 
      targetField: 'startDate', 
      required: true,
      dataType: 'date',
      validations: [
        { type: 'required', message: 'Start date is required' },
        { type: 'date', message: 'Invalid date format' }
      ]
    },
    { 
      sourceField: 'MEMBERSHIP_EXP_DATE', 
      targetField: 'endDate', 
      required: false,
      dataType: 'date',
      validations: [
        { type: 'date', message: 'Invalid date format' }
      ]
    },
    { 
      sourceField: 'MEMBERSHIP_FORM_OF_PAYMENT', 
      targetField: 'paymentMethod', 
      required: true,
      dataType: 'text',
      validations: [
        { type: 'required', message: 'Payment method is required' }
      ]
    },
    { 
      sourceField: 'current_status', 
      targetField: 'status', 
      required: true,
      dataType: 'text',
      validations: [
        { type: 'required', message: 'Status is required' }
      ]
    },
    { 
      sourceField: 'EFT_DUES_AMOUNT', 
      targetField: 'price', 
      required: true,
      dataType: 'number',
      validations: [
        { type: 'required', message: 'Price is required' },
        { type: 'number', message: 'Price must be a number' },
        { type: 'min', value: 0, message: 'Price cannot be negative' }
      ]
    }
  ]
};

// Field type definitions for UI display and validation
export const FIELD_TYPES = {
  text: {
    label: 'Text',
    icon: 'text',
    normalizer: 'normalizeText'
  },
  email: {
    label: 'Email',
    icon: 'email',
    normalizer: 'normalizeEmail'
  },
  phone: {
    label: 'Phone',
    icon: 'phone',
    normalizer: 'normalizePhone'
  },
  date: {
    label: 'Date',
    icon: 'calendar',
    normalizer: 'normalizeDate'
  },
  number: {
    label: 'Number',
    icon: 'hash',
    normalizer: 'normalizeNumber'
  }
};

// Data transformation templates
export const DATA_TRANSFORMATIONS = {
  customers: [
    // Example transformation: capitalize first and last names
    (row) => ({
      firstName: row.firstName ? row.firstName.charAt(0).toUpperCase() + row.firstName.slice(1) : row.firstName,
      lastName: row.lastName ? row.lastName.charAt(0).toUpperCase() + row.lastName.slice(1) : row.lastName
    }),
    // Example transformation: merge address fields
    (row) => ({
      fullAddress: row.address1 ? 
        (row.address2 ? `${row.address1}, ${row.address2}` : row.address1) : ''
    })
  ],
  memberships: [
    // Example transformation: ensure status is lowercase
    (row) => ({
      status: row.status ? row.status.toLowerCase() : row.status
    }),
    // Example transformation: format price to 2 decimal places if it's a number
    (row) => ({
      price: row.price && !isNaN(parseFloat(row.price)) ? 
        parseFloat(row.price).toFixed(2) : row.price
    })
  ]
};
