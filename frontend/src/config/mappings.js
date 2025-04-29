export const FIELD_MAPPINGS = {
  customers: [
    { sourceField: 'firstname', targetField: 'firstName', required: true },
    { sourceField: 'lastname', targetField: 'lastName', required: true },
    { sourceField: 'email', targetField: 'email', required: true },
    { sourceField: 'address1', targetField: 'address1', required: false },
    { sourceField: 'address2', targetField: 'address2', required: false },
    { sourceField: 'city', targetField: 'city', required: false },
    { sourceField: 'state', targetField: 'state', required: false },
    { sourceField: 'zip', targetField: 'postalCode', required: false },
    { sourceField: 'cell_phone', targetField: 'mobile', required: false },
    { sourceField: 'bday', targetField: 'birthdate', required: false },
    { sourceField: 'emergency_contact', targetField: 'emergencyName', required: false },
    { sourceField: 'emergency_phone', targetField: 'emergencyNumber', required: false },
    { sourceField: 'country', targetField: 'country', required: false },
    { sourceField: 'barcode', targetField: 'barcodeId', required: false },
    { sourceField: 'customer_id', targetField: 'externalId', required: true }
  ],
  memberships: [
    { sourceField: 'CUSTOMER_ID', targetField: 'customerId', required: true },
    { sourceField: 'MEMBERSHIP_START_DATE', targetField: 'startDate', required: true },
    { sourceField: 'MEMBERSHIP_EXP_DATE', targetField: 'endDate', required: false },
    { sourceField: 'MEMBERSHIP_FORM_OF_PAYMENT', targetField: 'paymentMethod', required: true },
    { sourceField: 'current_status', targetField: 'status', required: true },
    { sourceField: 'EFT_DUES_AMOUNT', targetField: 'price', required: true }
  ]
};
