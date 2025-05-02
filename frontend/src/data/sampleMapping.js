/**
 * Sample mapping data for use in demo/development
 * In production, this would be fetched from the Approach database
 */

// Sample membership types
export const membershipTypes = [
  {
    id: 1,
    name: 'Membership 1',
    description: 'Standard adult membership',
    price: 65.00,
    billingType: 'MONTHLY',
    isRecurring: true,
    billingDayOfMonth: 1,
    guestPassQuantity: 1
  },
  {
    id: 2,
    name: 'Membership 2',
    description: 'Premium family membership',
    price: 120.00,
    billingType: 'MONTHLY',
    isRecurring: true,
    billingDayOfMonth: 15,
    guestPassQuantity: 3
  }
];

// Sample pass types
export const passTypes = [
  {
    id: 1,
    name: 'Pass 1',
    description: 'Day pass',
    price: 20.00,
    defaultQuantity: 1,
    maxQuantity: 1
  },
  {
    id: 2,
    name: 'Pass 2',
    description: 'Punch card (10 visits)',
    price: 150.00,
    defaultQuantity: 10,
    maxQuantity: 10
  }
];

// Sample certification types
export const certificationTypes = [
  {
    id: 1,
    name: 'Certification 1',
    description: 'Belay certification',
    defaultDuration: 365 // Days
  },
  {
    id: 2,
    name: 'Certification 2',
    description: 'Lead climbing certification',
    defaultDuration: 365 // Days
  }
];

// Sample revenue categories for products
export const revenueCategories = [
  {
    id: 1,
    name: 'Food & Drinks',
    taxable: true
  },
  {
    id: 2,
    name: 'Climbing Gear',
    taxable: true
  },
  {
    id: 3,
    name: 'Rentals',
    taxable: true
  },
  {
    id: 4,
    name: 'Clothing',
    taxable: true
  }
];

// Sample locations
export const locations = [
  {
    id: 1,
    name: 'Main Location',
    address: '123 Main St'
  },
  {
    id: 2,
    name: 'Downtown Location',
    address: '456 Market St'
  }
];

// Helper function to look up membership type by external ID or name
export const lookupMembershipType = (externalId, name) => {
  // In RGP, membership external IDs look like: "BILLME-65" or "PREPAID-30"
  if (externalId) {
    if (externalId.startsWith('BILLME')) {
      const price = parseFloat(externalId.split('-')[1]);
      if (price === 65) return membershipTypes[0];
      if (price === 120) return membershipTypes[1];
    }
  }
  
  // Try matching by name
  if (name) {
    const matchByName = membershipTypes.find(type => 
      type.name.toLowerCase() === name.toLowerCase()
    );
    if (matchByName) return matchByName;
  }
  
  // Default to first membership type if no match
  return membershipTypes[0];
};

// Helper function to look up pass type by name
export const lookupPassType = (name) => {
  if (name) {
    const matchByName = passTypes.find(type => 
      type.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(type.name.toLowerCase())
    );
    if (matchByName) return matchByName;
  }
  
  // Default to first pass type if no match
  return passTypes[0];
};

// Helper function to look up certification type by name
export const lookupCertificationType = (name) => {
  if (name) {
    const matchByName = certificationTypes.find(type => 
      type.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(type.name.toLowerCase())
    );
    if (matchByName) return matchByName;
  }
  
  // Default to first certification type if no match
  return certificationTypes[0];
};

// Export all mapping data and lookup functions
export default {
  membershipTypes,
  passTypes,
  certificationTypes,
  revenueCategories,
  locations,
  lookupMembershipType,
  lookupPassType,
  lookupCertificationType
};
