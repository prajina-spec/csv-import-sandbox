import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import mappingData from '../data/sampleMapping';

// Transformation engine translates the SQL transform logic to JavaScript
const TransformationEngine = ({ 
  provider, 
  importType, 
  files, 
  parseResults, 
  onComplete, 
  onError 
}) => {
  const [step, setStep] = useState(1);
  const [transformedData, setTransformedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const locationName = 'default'; // This would come from user input in a real implementation

  useEffect(() => {
    // Start transformation process when component mounts
    processTransformation();
  }, []);

  const processTransformation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Each provider and import type has specific transform logic
      if (provider === 'RGP') {
        await processRGPTransformation();
      } else if (provider === 'MBO') {
        await processMBOTransformation();
      } else {
        await processGenericTransformation();
      }
      
      setLoading(false);
      onComplete(transformedData);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      onError(err);
    }
  };

  // Process RGP data transformations
  const processRGPTransformation = async () => {
    // Transform each import type based on RGP SQL scripts
    if (importType === 'customers') {
      await rgpCustomerTransformation();
    } else if (importType === 'memberships') {
      await rgpMembershipTransformation();
    } else if (importType === 'passes') {
      await rgpPassesTransformation();
    } else if (importType === 'waivers') {
      await rgpWaiversTransformation();
    } else if (importType === 'giftCards') {
      await rgpGiftCardsTransformation();
    } else if (importType === 'certifications') {
      await rgpCertificationsTransformation();
    }
  };

  // Process MBO data transformations
  const processMBOTransformation = async () => {
    // Transform each import type based on MBO SQL scripts
    if (importType === 'customers') {
      await mboCustomerTransformation();
    } else if (importType === 'memberships') {
      await mboMembershipTransformation();
    } else if (importType === 'passes') {
      await mboPassesTransformation();
    } else if (importType === 'waivers') {
      await mboWaiversTransformation();
    } else if (importType === 'giftCards') {
      await mboGiftCardsTransformation();
    } else if (importType === 'storeCredit') {
      await mboStoreCreditTransformation();
    }
  };

  // Generic transformation for "Other" provider
  const processGenericTransformation = async () => {
    // Simple pass-through for "Other" provider
    setTransformedData({
      [importType]: parseResults[`${importType}.csv`].data
    });
    setProgress(100);
  };

  //
  // RGP Transformations
  //

  // RGP Customer Transformation (following SQL scripts)
  const rgpCustomerTransformation = async () => {
    // Get the raw customer data
    const rawCustomerData = parseResults['Customer.csv']?.data || [];
    
    // STEP 1: Extract relevant fields and create locationName
    setStep(1);
    setProgress(25);
    
    const step1Data = rawCustomerData.map(row => ({
      locationName,
      customer_id: row.customer_id || '',
      firstname: row.firstname || '',
      lastname: row.lastname || '',
      last_record_edit: row.last_record_edit || '',
      responsible_party_id: row.responsible_party_id || '',
      address1: row.address1 || '',
      address2: row.address2 || '',
      cell_phone: row.cell_phone || '',
      city: row.city || '',
      email: row.email || '',
      emergency_contact: row.emergency_contact || '',
      emergency_phone: row.emergency_phone || '',
      state: row.state || '',
      zip: row.zip || '',
      bday: row.bday || '',
      policy1_date: row.policy1_date || '',
      country: row.country || '',
      barcode: row.barcode || ''
    }));
    
    // STEP 2: Format the data according to our schema
    setStep(2);
    setProgress(50);
    
    const step2Data = step1Data.map(row => {
      // Format birthday
      let birthdate = null;
      if (row.bday) {
        // Try to parse various date formats
        const dateParts = row.bday.split('/');
        if (dateParts.length === 3) {
          // MM/DD/YYYY format
          birthdate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        } else {
          birthdate = row.bday;
        }
      }
      
      // Format phone
      let mobile = null;
      if (row.cell_phone) {
        mobile = '+1' + row.cell_phone.replace(/[()\\s-]/g, '');
      }
      
      // Format emergency phone
      let emergencyNumber = null;
      if (row.emergency_phone) {
        emergencyNumber = '+1' + row.emergency_phone.replace(/[()\\s-]/g, '');
      }
      
      // Create externalId
      const externalId = `${row.customer_id}_${locationName}`;
      
      return {
        externalId,
        id: null, // Will be assigned by the DB
        firstName: row.firstname,
        lastName: row.lastname,
        company: null,
        address1: row.address1,
        address2: row.address2,
        city: row.city,
        state: row.state,
        postalCode: row.zip,
        email: row.email ? row.email : null,
        secondaryEmail: row.email ? row.email : null, // Will be handled in step 3
        countryCode: row.country === 'United States' || row.country === 'USA' ? 'US' : null,
        mobile,
        home: null,
        metadata: null,
        createdAt: formatRgpDate(row.last_record_edit),
        updatedAt: new Date().toISOString(),
        additionalInfo: null,
        notes: null,
        customerHasActivity: null,
        UUID: uuidv4(),
        birthdate,
        imageURL: null,
        billingAddress1: null,
        billingAddress2: null,
        billingCity: null,
        billingState: null,
        billingPostalCode: null,
        parentCustomerId: null,
        emergencyName: row.emergency_contact,
        emergencyNumber,
        emergencyRelation: null,
        isCorporate: null,
        documents: null,
        gender: null,
        isMinor: birthdate && new Date(birthdate) > new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000) ? 1 : 0,
        stripeId: null,
        isActive: 1,
        barcodeId: row.barcode && row.barcode.trim() !== '' ? row.barcode : null
      };
    });
    
    // STEP 3: Handle duplicate emails and barcodes
    setStep(3);
    setProgress(75);
    
    // Create a copy of step2Data
    const step3Data = [...step2Data];
    
    // Handle duplicate emails
    const emailCounts = {};
    step3Data.forEach(row => {
      if (row.email) {
        emailCounts[row.email] = (emailCounts[row.email] || 0) + 1;
      }
    });
    
    // Move duplicates to secondaryEmail and null the email
    step3Data.forEach(row => {
      if (row.email && emailCounts[row.email] > 1) {
        row.secondaryEmail = row.email;
        row.email = null;
      } else if (row.email && emailCounts[row.email] === 1) {
        row.secondaryEmail = null;
      }
    });
    
    // Handle duplicate barcodes
    const barcodeCounts = {};
    step3Data.forEach(row => {
      if (row.barcodeId) {
        barcodeCounts[row.barcodeId] = (barcodeCounts[row.barcodeId] || 0) + 1;
      }
    });
    
    // Null duplicate barcodes
    step3Data.forEach(row => {
      if (row.barcodeId && barcodeCounts[row.barcodeId] > 1) {
        row.barcodeId = null;
      }
    });
    
    // STEP 4: Final formatting
    setStep(4);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      customers: step3Data
    });
  };

  // RGP Membership Transformation
  const rgpMembershipTransformation = async () => {
    // Get the raw customer data
    const rawCustomerData = parseResults['Customer.csv']?.data || [];
    
    // STEP 1: Extract relevant fields for membership
    setStep(1);
    setProgress(25);
    
    const step1Data = rawCustomerData
      .filter(row => row.CUSTOMER_TYPE === 'MEMBER' && row.current_status !== 'TERMINATED' && row.current_status !== '')
      .map(row => ({
        locationName,
        CUSTOMER_ID: row.customer_id || '',
        RESPONSIBLE_PARTY_ID: row.responsible_party_id || '',
        MEMBERSHIP_START_DATE: row.MEMBERSHIP_START_DATE || '',
        MEMBERSHIP_EXP_DATE: row.MEMBERSHIP_EXP_DATE || '',
        MEMBERSHIP_FORM_OF_PAYMENT: row.MEMBERSHIP_FORM_OF_PAYMENT || '',
        current_status: row.current_status || '',
        NEXT_BILL_DATE: row.NEXT_BILL_DATE || '',
        EFT_DUES_AMOUNT: row.EFT_DUES_AMOUNT || '',
        GUID: row.GUID || ''
      }));

    // STEP 2: Format the data according to our schema
    setStep(2);
    setProgress(50);
    
    const step2Data = step1Data.map(row => {
      // Format dates
      let startEffectiveDate = '';
      if (row.MEMBERSHIP_START_DATE) {
        startEffectiveDate = row.MEMBERSHIP_START_DATE;
      } else {
        startEffectiveDate = new Date().toISOString().split('T')[0];
      }
      
      let endEffectiveDate = null;
      if (row.MEMBERSHIP_EXP_DATE) {
        endEffectiveDate = row.MEMBERSHIP_EXP_DATE;
      }
      
      // Calculate billing type and membership type ID
      let billingType = 'MONTHLY';
      let membershipTypeId = '';
      
      if (row.MEMBERSHIP_FORM_OF_PAYMENT === 'PREPAID') {
        billingType = 'DOP';
        
        // Calculate days between start and end for prepaid
        const days = calculateDaysBetween(row.MEMBERSHIP_START_DATE, row.MEMBERSHIP_EXP_DATE);
        membershipTypeId = `${row.MEMBERSHIP_FORM_OF_PAYMENT}-${days}`;
      } else {
        membershipTypeId = `${row.MEMBERSHIP_FORM_OF_PAYMENT}-${row.EFT_DUES_AMOUNT}`;
      }
      
      // Calculate next bill date for recurring memberships
      let nextBillDate = null;
      if (row.NEXT_BILL_DATE && row.MEMBERSHIP_FORM_OF_PAYMENT !== 'PREPAID') {
        const date = new Date(row.NEXT_BILL_DATE);
        date.setMonth(date.getMonth() + 1);
        nextBillDate = date.toISOString().split('T')[0];
      }
      
      // Create externalId
      const externalId = `${row.CUSTOMER_ID}_${locationName}`;
      const customer_externalId = externalId;
      const responsible_party_id_externalId = `${row.RESPONSIBLE_PARTY_ID}_${locationName}`;
      
      return {
        id: null, // Will be assigned by the DB
        startEffectiveDate,
        endEffectiveDate,
        cancelDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        membershipTypeId, // This will be mapped to actual IDs later
        discountPercentage: null,
        discountFlat: null,
        discountDescription: null,
        status: row.current_status === 'FROZEN' ? 'hold' : 'active',
        hasUnpaidBill: null,
        isActive: 1,
        isValid: row.current_status === 'FROZEN' ? 0 : 1,
        customerId: null, // Will be filled in step 3 with actual customer ID
        assignedCustomerId: null, // Will be filled in step 3
        price: row.EFT_DUES_AMOUNT,
        unitPrice: null,
        previousMembership: null,
        purchasedLocationId: locationName,
        billCount: null,
        billWeekDay: null,
        billMonthDay: null,
        billYearDay: null,
        notes: null,
        useCount: null,
        billingType,
        billingDayOfWeek: null, // Will be calculated in step 5
        billingDayOfMonth: null, // Will be calculated in step 5
        nextBillDate,
        holdStartDate: null,
        holdEndDate: null,
        soldById: null,
        updatedById: null,
        externalId,
        termsCheckedDT: null,
        createdBy: null,
        updatedBy: null,
        guestPassQuantity: 0,
        guestPassRestrictionInDays: null,
        paymentCardId: null,
        isRecurring: row.MEMBERSHIP_EXP_DATE === '' || row.MEMBERSHIP_FORM_OF_PAYMENT !== 'PREPAID' ? 1 : null,
        contractStartDate: null,
        contractEndDate: null,
        description: null,
        customer_externalId, // Temporary field for linking, will be removed in step 3
        responsible_party_id_externalId // Temporary field for linking, will be removed in step 3
      };
    });
    
    // STEP 3: Link with customer IDs and apply mapping
    setStep(3);
    setProgress(75);
    
    const step3Data = step2Data.map(membership => {
      // Apply membership type mapping
      const mappedType = mappingData.lookupMembershipType(membership.membershipTypeId);
      if (mappedType) {
        membership.membershipTypeId = mappedType.id;
      }
      
      return membership; // In real implementation, would also add customer IDs here
    });
    
    // STEP 4: Final formatting
    setStep(4);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      memberships: step3Data
    });
  };

  // RGP Passes Transformation
  const rgpPassesTransformation = async () => {
    // Get the raw punches data
    const rawPunchesData = parseResults['Punches.csv']?.data || [];
    
    // STEP 1: Extract relevant fields and create locationName
    setStep(1);
    setProgress(25);
    
    const step1Data = [];
    
    // Group punches by customer_id and calculate remaining
    const customerPunches = {};
    
    rawPunchesData.forEach(row => {
      if (row.voided !== '1') { // Skip voided punches
        const customerId = row.CUSTOMER_ID;
        if (!customerPunches[customerId]) {
          customerPunches[customerId] = {
            customer_id: customerId,
            barcode: null,
            locationName,
            remaining: 0
          };
        }
        
        // Add delta (negative for used punches, positive for added)
        customerPunches[customerId].remaining += parseInt(row.delta || 0);
      }
    });
    
    // Convert to array and filter out non-positive remaining
    Object.values(customerPunches).forEach(punch => {
      if (punch.remaining > 0) {
        step1Data.push(punch);
      }
    });
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(50);
    
    const step2Data = step1Data.map(row => {
      // Create externalId
      const externalId = `${row.customer_id}_${locationName}`;
      
      // Get mapped pass type
      const mappedPassType = mappingData.lookupPassType('Pass 1');
      
      return {
        id: null, // Will be assigned by the DB
        passTypeId: mappedPassType.id, // Using the mapped pass type ID
        ticketTypeId: null,
        orderId: 0,
        eventId: null,
        bookingId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        price: null,
        isActive: 1,
        quantity: row.remaining,
        purchasedQuantity: row.remaining,
        customerId: null, // Will be filled in step 3
        assignedCustomerId: null, // Will be filled in step 3
        purchasedDate: null,
        startEffectiveDate: new Date().toISOString(),
        endEffectiveDate: null,
        cancelDate: null,
        type: null,
        UUID: uuidv4(),
        soldById: null,
        updatedById: null,
        externalId,
        termsCheckedDT: null,
        createdBy: null,
        updatedBy: null,
        isValidForAll: null,
        revenuecategoryId: null
      };
    });
    
    // STEP 3: Link with customer IDs
    setStep(3);
    setProgress(75);
    
    // This step would typically use the imported customer data
    // For now, we'll simulate this by using the externalId references
    const step3Data = step2Data.map(pass => {
      return pass; // In real implementation, would add customer IDs here
    });
    
    // STEP 4: Final formatting
    setStep(4);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      passes: step3Data
    });
  };

  // RGP Waivers Transformation
  const rgpWaiversTransformation = async () => {
    // Get the raw customer data
    const rawCustomerData = parseResults['Customer.csv']?.data || [];
    
    // STEP 1: Extract relevant fields for waivers
    setStep(1);
    setProgress(25);
    
    const step1Data = rawCustomerData
      .filter(row => row.FACILITY_WAIVER_DATE && row.FACILITY_WAIVER_DATE !== '')
      .map(row => ({
        locationName,
        customer_id: row.customer_id || '',
        FACILITY_WAIVER_DATE: row.FACILITY_WAIVER_DATE || ''
      }));
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(50);
    
    const step2Data = step1Data.map(row => {
      // Format waiver date
      let waiverDate = null;
      if (row.FACILITY_WAIVER_DATE) {
        const dateParts = row.FACILITY_WAIVER_DATE.split('/');
        if (dateParts.length === 3) {
          // MM/DD/YYYY format
          waiverDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        } else {
          // Try to parse as is
          waiverDate = row.FACILITY_WAIVER_DATE;
        }
      }
      
      // Create externalId
      const externalId = `${row.customer_id}_${locationName}`;
      
      return {
        id: null, // Will be assigned by the DB
        name: null, // Will be filled in step 3
        address1: null, // Will be filled in step 3
        address2: null, // Will be filled in step 3
        city: null, // Will be filled in step 3
        state: null, // Will be filled in step 3
        postalCode: null, // Will be filled in step 3
        primaryPhone: null, // Will be filled in step 3
        email: null, // Will be filled in step 3
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null, // Will be filled in step 3
        envelopeId: null,
        templateId: null,
        url: null,
        envelopeUrl: null,
        status: 'signed',
        documentTitle: 'RGP Waiver',
        documents: JSON.stringify([{
          url: "",
          name: "Please reference waiver from RGP.pdf",
          description: "none"
        }]),
        dependents: null,
        startEffectiveDT: waiverDate,
        endEffectiveDT: null, // This would be set based on gym policy
        signedDT: waiverDate,
        source: null,
        UUID: uuidv4(),
        externalId,
        createdBy: null,
        updatedBy: null,
        signedById: null // Will be filled in step 3
      };
    });
    
    // STEP 3: Link with customer data
    setStep(3);
    setProgress(75);
    
    // This step would typically use the imported customer data
    // For now, we'll simulate this by using the externalId references
    const step3Data = step2Data.map(waiver => {
      return waiver; // In real implementation, would add customer details here
    });
    
    // STEP 4: Final formatting
    setStep(4);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      waivers: step3Data
    });
  };

  // RGP Gift Cards Transformation
  const rgpGiftCardsTransformation = async () => {
    // Get the raw gift card data
    const rawGiftCardData = parseResults['Gift Cards Balances.csv']?.data || [];
    
    // STEP 1: Extract relevant fields
    setStep(1);
    setProgress(33);
    
    const step1Data = rawGiftCardData.map(row => ({
      Cardnumber: row.Cardnumber || '',
      Balance: row.Balance || '',
      Solddate: row.Solddate || ''
    }));
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(66);
    
    const step2Data = step1Data.map(row => {
      // Format balance (remove $ sign)
      let balance = row.Balance;
      if (balance && balance.startsWith('$')) {
        balance = balance.substring(1);
      }
      
      return {
        id: null, // Will be assigned by the DB
        amount: balance,
        balance: balance,
        externalId: row.Cardnumber,
        recipientEmail: null,
        isActive: 1,
        cancelDate: null,
        UUID: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
        customerId: null,
        assignedCustomerId: null,
        orderId: null,
        message: 'Credit imported from RGP',
        to: null,
        from: null,
        revenueCategoryId: null
      };
    });
    
    // STEP 3: Final formatting
    setStep(3);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      giftCards: step2Data
    });
  };

  // RGP Certifications Transformation
  const rgpCertificationsTransformation = async () => {
    // Get the raw customer data
    const rawCustomerData = parseResults['Customer.csv']?.data || [];
    
    // STEP 1: Extract customers with certifications
    setStep(1);
    setProgress(33);
    
    const step1Data = rawCustomerData
      .filter(row => row.BELAY_CERTIFIED && row.BELAY_CERTIFIED !== '')
      .map(row => ({
        locationName,
        CUSTOMER_ID: row.customer_id || '',
        BELAY_CERTIFIED: row.BELAY_CERTIFIED || ''
      }));
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(66);
    
    const step2Data = step1Data.map(row => {
      // Create externalId
      const externalId = `${row.CUSTOMER_ID}_${locationName}`;
      
      // Map certification type
      const mappedCertType = mappingData.lookupCertificationType(row.BELAY_CERTIFIED);
      
      return {
        id: null, // Will be assigned by the DB
        customerId: null, // Will be filled in step 3
        certificationId: mappedCertType.id, // Using the mapped certification type ID
        startEffectiveDate: null, // These would be input by the customer
        endEffectiveDate: null,
        documents: null,
        externalId // Temporary field for linking
      };
    });
    
    // STEP 3: Link with customer data
    setStep(3);
    setProgress(100);
    
    // This step would typically use the imported customer data
    // For now, we'll simulate this by using the externalId references
    const step3Data = step2Data.map(certification => {
      return certification; // In real implementation, would add customer IDs here
    });
    
    // Store the transformed data
    setTransformedData({
      certifications: step3Data
    });
  };

  //
  // MBO Transformations
  //

  // MBO Customer Transformation
  const mboCustomerTransformation = async () => {
    // Get the raw customer data
    const rawCustomerData = parseResults['Clients.csv']?.data || [];
    
    // STEP 1: Extract relevant fields
    setStep(1);
    setProgress(25);
    
    const step1Data = rawCustomerData.map(row => ({
      locationName,
      FirstName: row.FirstName || '',
      LastName: row.LastName || '',
      Address: row.Address || '',
      Address2: row.Address2 || '',
      City: row.City || '',
      State: row.State || '',
      PostalCode: row.PostalCode || '',
      Country: row.Country || '',
      HomePhone: row.HomePhone || '',
      CellPhone: row.CellPhone || '',
      EmailName: row.EmailName || '',
      MBSystemId: row.MBSystemId || '',
      EmergContact: row.EmergContact || '',
      EmergPhone: row.EmergPhone || '',
      EmergRela: row.EmergRela || '',
      CompanyName: row.CompanyName || '',
      IsCompany: row.IsCompany || '',
      Birthdate: row.Birthdate || '',
      ProfileCreationDate: row.ProfileCreationDate || '',
      BarcodeId: row.BarcodeId || ''
    }));
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(50);
    
    const step2Data = step1Data.map(row => {
      // Create MBSystemId with location
      const MBSystemId_location = `${row.MBSystemId}_${locationName}`;
      
      // Format birthdate
      let birthdate = null;
      if (row.Birthdate) {
        // Try to parse it directly first
        const date = new Date(row.Birthdate);
        if (!isNaN(date.getTime())) {
          birthdate = date.toISOString().split('T')[0];
        } else {
          // Try to identify format and convert
          birthdate = formatMboDate(row.Birthdate);
        }
      }
      
      // Format phone numbers
      let mobile = null;
      if (row.CellPhone) {
        mobile = '+1' + row.CellPhone.replace(/[()\\s-]/g, '');
      }
      
      let home = null;
      if (row.HomePhone) {
        home = row.HomePhone;
      }
      
      // Format emergency phone
      let emergencyNumber = null;
      if (row.EmergPhone) {
        emergencyNumber = '+1' + row.EmergPhone.replace(/[()\\s-]/g, '');
      }
      
      // Extract emergency contact name (remove numbers and special chars)
      let emergencyName = row.EmergContact;
      if (emergencyName) {
        emergencyName = emergencyName
          .replace(/[0-9]/g, '')
          .replace(/-/g, '')
          .trim();
      }
      
      return {
        firstName: row.FirstName,
        lastName: row.LastName,
        company: row.IsCompany ? row.CompanyName : null,
        address1: row.Address || null,
        address2: row.Address2 || null,
        city: row.City || null,
        state: row.State,
        postalCode: row.PostalCode || null,
        email: row.EmailName ? row.EmailName.trim().toLowerCase() : null,
        secondaryEmail: row.EmailName ? row.EmailName.trim().toLowerCase() : null, // Will be handled in step 3
        countryCode: row.Country === 'United States' || row.Country === 'USA' ? 'US' : row.Country,
        mobile,
        home,
        createdAt: formatMboDate(row.ProfileCreationDate) || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        UUID: uuidv4(),
        birthdate,
        emergencyName,
        emergencyNumber,
        emergencyRelation: row.EmergRela || null,
        isMinor: birthdate && new Date(birthdate) > new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000) ? 1 : 0,
        externalId: MBSystemId_location,
        isActive: 1,
        barcodeId: row.BarcodeId || null,
        
        // Include original data for debugging
        MBSystemId_location
      };
    });
    
    // STEP 3: Handle duplicate emails and barcodes
    setStep(3);
    setProgress(75);
    
    // Create a copy of step2Data
    const step3Data = [...step2Data];
    
    // Handle duplicate emails
    const emailCounts = {};
    step3Data.forEach(row => {
      if (row.email) {
        emailCounts[row.email] = (emailCounts[row.email] || 0) + 1;
      }
    });
    
    // Move duplicates to secondaryEmail and null the email
    step3Data.forEach(row => {
      if (row.email && emailCounts[row.email] > 1) {
        row.secondaryEmail = row.email;
        row.email = null;
      } else if (row.email && emailCounts[row.email] === 1) {
        row.secondaryEmail = null;
      }
    });
    
    // Handle duplicate barcodes
    const barcodeCounts = {};
    step3Data.forEach(row => {
      if (row.barcodeId) {
        barcodeCounts[row.barcodeId] = (barcodeCounts[row.barcodeId] || 0) + 1;
      }
    });
    
    // Null duplicate barcodes
    step3Data.forEach(row => {
      if (row.barcodeId && barcodeCounts[row.barcodeId] > 1) {
        row.barcodeId = null;
      }
    });
    
    // STEP 4: Final formatting
    setStep(4);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      customers: step3Data
    });
  };

  // MBO Membership Transformation
  const mboMembershipTransformation = async () => {
    // For MBO, we need to handle both recurring and non-recurring memberships
    
    // Get the raw contract data (recurring)
    const rawAutopayData = parseResults['ClientAutopayContracts.csv']?.data || [];
    
    // Get the raw pricing options data (non-recurring)
    const rawPricingData = parseResults['ClientPricingOptions.csv']?.data || [];
    
    // Process recurring memberships
    await mboRecurringMembershipTransformation(rawAutopayData);
    
    // Process non-recurring memberships
    await mboNonRecurringMembershipTransformation(rawPricingData);
  };
  
  // MBO Recurring Membership Transformation
  const mboRecurringMembershipTransformation = async (rawAutopayData) => {
    // STEP 1: Extract relevant fields for recurring memberships
    setStep(1);
    setProgress(25);
    
    const step1Data = rawAutopayData
      .filter(row => {
        // Only include active contracts
        return row.NextPaymentDate === 'Contract Completed' 
          ? new Date(formatMboDate(row.ContractEndDate)) > new Date()
          : true;
      })
      .map(row => ({
        locationName,
        ClientContractID: row.ClientContractID || '',
        PayingClientID: row.PayingClientID || '',
        ReceivingClientID: row.ReceivingClientId || '',
        ContractStartDate: row.ContractStartDate || '',
        ContractEndDate: row.ContractEndDate || '',
        NormalPaymentAmount: row.NormalPaymentAmount || '',
        ContractName: row.ContractName || '',
        NextPaymentDate: row.NextPaymentDate || '',
        AutoRenewing: row.AutoRenewing || '',
        ContractSuspendStartDate: row.ContractSuspendStartDate || ''
      }));
    
    // STEP 2: Group and calculate dates
    setStep(2);
    setProgress(50);
    
    // Group by contract ID to combine multiple entries
    const contractGroups = {};
    step1Data.forEach(row => {
      if (!contractGroups[row.ClientContractID]) {
        contractGroups[row.ClientContractID] = {
          ...row,
          StartDate: null,
          EndDate: null,
          PaymentDate: null,
          HoldStartDate: null
        };
      }
      
      // Get minimum start date
      const startDate = formatMboDate(row.ContractStartDate);
      if (startDate && (!contractGroups[row.ClientContractID].StartDate || startDate < contractGroups[row.ClientContractID].StartDate)) {
        contractGroups[row.ClientContractID].StartDate = startDate;
      }
      
      // Get maximum end date
      const endDate = formatMboDate(row.ContractEndDate);
      if (endDate && (!contractGroups[row.ClientContractID].EndDate || endDate > contractGroups[row.ClientContractID].EndDate)) {
        contractGroups[row.ClientContractID].EndDate = endDate;
      }
      
      // Get maximum payment date
      const paymentDate = formatMboDate(row.NextPaymentDate);
      if (paymentDate && (!contractGroups[row.ClientContractID].PaymentDate || paymentDate > contractGroups[row.ClientContractID].PaymentDate)) {
        contractGroups[row.ClientContractID].PaymentDate = paymentDate;
      }
      
      // Get minimum hold start date
      if (row.ContractSuspendStartDate) {
        const holdStartDate = formatMboDate(row.ContractSuspendStartDate);
        if (holdStartDate && (!contractGroups[row.ClientContractID].HoldStartDate || holdStartDate < contractGroups[row.ClientContractID].HoldStartDate)) {
          contractGroups[row.ClientContractID].HoldStartDate = holdStartDate;
        }
      }
      
      // Create externalId
      contractGroups[row.ClientContractID].externalId = `${row.ClientContractID}_${locationName}`;
      contractGroups[row.ClientContractID].PayingClientID_location = `${row.PayingClientID}_${locationName}`;
      contractGroups[row.ClientContractID].ReceivingClientID_location = `${row.ReceivingClientID}_${locationName}`;
    });
    
    const step2Data = Object.values(contractGroups);
    
    // STEP 3: Format data for our schema
    setStep(3);
    setProgress(75);
    
    const step3Data = step2Data.map(row => {
      // Determine status based on hold date
      const status = row.HoldStartDate && new Date(row.HoldStartDate) <= new Date() ? 'hold' : 'active';
      const isActive = status === 'hold' ? 0 : 1;
      const isValid = status === 'hold' ? 0 : 1;
      
      // Calculate next bill date for recurring memberships
      let nextBillDate = null;
      if (row.PaymentDate) {
        // Add one month to the payment date
        const date = new Date(row.PaymentDate);
        date.setMonth(date.getMonth() + 1);
        nextBillDate = date.toISOString().split('T')[0];
      }
      
      // Map membership type
      const mappedType = mappingData.lookupMembershipType(null, row.ContractName);
      
      return {
        id: null, // Will be assigned by the DB
        startEffectiveDate: row.StartDate,
        endEffectiveDate: row.AutoRenewing === 'True' ? null : row.EndDate,
        cancelDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        membershipTypeId: mappedType ? mappedType.id : null, // Using mapped membership type
        discountPercentage: null,
        discountFlat: null,
        discountDescription: null,
        status,
        hasUnpaidBill: null,
        isActive,
        isValid,
        customerId: null, // Will be filled with actual customer ID later
        assignedCustomerId: null, // Will be filled with actual customer ID later
        price: row.NormalPaymentAmount,
        unitPrice: null,
        previousMembership: null,
        purchasedLocationId: locationName,
        billCount: null,
        billWeekDay: null,
        billMonthDay: null,
        billYearDay: null,
        notes: null,
        useCount: null,
        billingType: 'MONTHLY', // Will be updated in step 5
        billingDayOfWeek: null, // Will be calculated in step 5
        billingDayOfMonth: null, // Will be calculated in step 5
        nextBillDate,
        holdStartDate: row.HoldStartDate,
        holdEndDate: null,
        soldById: null,
        updatedById: null,
        externalId: row.externalId,
        termsCheckedDT: null,
        createdBy: null,
        updatedBy: null,
        guestPassQuantity: 0, // Will be updated in step 5
        guestPassRestrictionInDays: null,
        paymentCardId: null,
        isRecurring: row.AutoRenewing === 'True' ? 1 : null,
        contractStartDate: null,
        contractEndDate: null,
        description: null,
        
        // Temporary fields for linking, will be removed later
        customer_mbsystemid_location: row.PayingClientID_location,
        assignedCustomer_mbsystemid_location: row.ReceivingClientID_location
      };
    });
    
    // STEP 4: Store the transformed data
    setStep(4);
    setProgress(100);
    
    // Store the transformed recurring membership data
    setTransformedData(prev => ({
      ...prev,
      recurringMemberships: step3Data
    }));
  };
  
  // MBO Non-Recurring Membership Transformation
  const mboNonRecurringMembershipTransformation = async (rawPricingData) => {
    // STEP 1: Extract relevant fields for non-recurring memberships
    setStep(1);
    setProgress(25);
    
    // Filter pricing options for valid memberships
    const step1Data = rawPricingData
      .filter(row => {
        // Only include non-recurring memberships that aren't in the autopay contracts
        // and are valid membership types (not class passes or unpaid items)
        return row['Program/Service Category']?.toLowerCase() === 'memberships' &&
               !['Unpaid', 'Count Series', 'Time Series', 'Free Membership', 'Notes Flag'].includes(row.ItemType) &&
               !row.Description?.toLowerCase().includes('pass') &&
               ['Months', 'Days'].includes(row.DurationUnit) &&
               new Date(formatMboDate(row.ExpDate)) > new Date() &&
               row.Returned === 'False';
      })
      .map(row => ({
        locationName,
        ClientContractID: row.ClientContractID?.replace(/\\r/g, '') || '',
        MBSystemID: row.MBSystemID || '',
        ActiveDate: row.ActiveDate || '',
        PaymentAmount: row.PaymentAmount || '',
        ExpDate: row.ExpDate || '',
        Description: row.Description || '',
        DurationUnit: row.DurationUnit || ''
      }));
    
    // STEP 2: Calculate contract dates
    setStep(2);
    setProgress(50);
    
    // Group by contract ID to combine multiple entries
    const contractGroups = {};
    step1Data.forEach(row => {
      if (!contractGroups[row.ClientContractID]) {
        contractGroups[row.ClientContractID] = {
          ...row,
          ContractStartDate: null,
          ContractEndDate: null
        };
      }
      
      // Get minimum start date
      const startDate = formatMboDate(row.ActiveDate);
      if (startDate && (!contractGroups[row.ClientContractID].ContractStartDate || startDate < contractGroups[row.ClientContractID].ContractStartDate)) {
        contractGroups[row.ClientContractID].ContractStartDate = startDate;
      }
      
      // Get maximum end date
      const endDate = formatMboDate(row.ExpDate);
      if (endDate && (!contractGroups[row.ClientContractID].ContractEndDate || endDate > contractGroups[row.ClientContractID].ContractEndDate)) {
        contractGroups[row.ClientContractID].ContractEndDate = endDate;
      }
      
      // Create externalId
      contractGroups[row.ClientContractID].externalId = `${row.ClientContractID}_${locationName}`;
      contractGroups[row.ClientContractID].PayingClientID_location = `${row.MBSystemID}_${locationName}`;
    });
    
    const step2Data = Object.values(contractGroups);
    
    // STEP 3: Format data for our schema
    setStep(3);
    setProgress(75);
    
    const step3Data = step2Data.map(row => {
      // Map membership type
      const mappedType = mappingData.lookupMembershipType(null, row.Description);
      
      return {
        id: null, // Will be assigned by the DB
        startEffectiveDate: row.ContractStartDate,
        endEffectiveDate: row.ContractEndDate,
        cancelDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        membershipTypeId: mappedType ? mappedType.id : null, // Using mapped membership type
        discountPercentage: null,
        discountFlat: null,
        discountDescription: null,
        status: 'active',
        hasUnpaidBill: null,
        isActive: 1,
        isValid: 1,
        customerId: null, // Will be filled with actual customer ID later
        assignedCustomerId: null, // Will be filled with actual customer ID later
        price: row.PaymentAmount,
        unitPrice: null,
        previousMembership: null,
        purchasedLocationId: locationName,
        billCount: null,
        billWeekDay: null,
        billMonthDay: null,
        billYearDay: null,
        notes: null,
        useCount: null,
        billingType: 'DOP',
        billingDayOfWeek: null,
        billingDayOfMonth: null,
        nextBillDate: null,
        holdStartDate: null,
        holdEndDate: null,
        soldById: null,
        updatedById: null,
        externalId: row.externalId,
        termsCheckedDT: null,
        createdBy: null,
        updatedBy: null,
        guestPassQuantity: 0, // Will be updated in step 5
        guestPassRestrictionInDays: null,
        paymentCardId: null,
        isRecurring: 0,
        contractStartDate: row.ContractStartDate,
        contractEndDate: row.ContractEndDate,
        description: null,
        
        // Temporary field for linking, will be removed later
        customer_mbsystemid_location: row.PayingClientID_location,
      };
    });
    
    // STEP 4: Store the transformed data
    setStep(4);
    setProgress(100);
    
    // Store the transformed non-recurring membership data
    setTransformedData(prev => ({
      ...prev,
      nonRecurringMemberships: step3Data
    }));
  };

  // MBO Passes Transformation
  const mboPassesTransformation = async () => {
    // Get the raw passes data
    const rawPassesData = parseResults['Visits Remaining Report.csv']?.data || [];
    
    // STEP 1: Group by client and pricing option
    setStep(1);
    setProgress(33);
    
    const passGroups = {};
    rawPassesData.forEach(row => {
      const clientId = row['Client ID'];
      const pricingOption = row['Pricing Option'];
      
      // Only include passes (filter by pricing option name)
      if (pricingOption && pricingOption.toLowerCase().includes('pass')) {
        const key = `${clientId}-${pricingOption}`;
        
        if (!passGroups[key]) {
          passGroups[key] = {
            r_clientid: clientId,
            locationName,
            MBSystemId_location: `${clientId}_${locationName}`,
            r_pricingoption: pricingOption,
            total: 0
          };
        }
        
        // Add remaining visits
        passGroups[key].total += parseInt(row['Visits Remaining'] || 0);
      }
    });
    
    // Convert to array and filter out non-positive remaining visits
    const step1Data = Object.values(passGroups).filter(pass => pass.total > 0);
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(66);
    
    const step2Data = step1Data.map(row => {
      // Map pass type
      const mappedPassType = mappingData.lookupPassType(row.r_pricingoption);
      
      return {
        id: null, // Will be assigned by the DB
        passTypeId: mappedPassType ? mappedPassType.id : null, // Using mapped pass type
        orderId: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        isActive: 1,
        quantity: row.total,
        purchasedQuantity: row.total,
        customerId: null, // Will be filled with actual customer ID later
        assignedCustomerId: null, // Will be filled with actual customer ID later
        startEffectiveDate: new Date().toISOString(),
        UUID: uuidv4(),
        externalId: row.MBSystemId_location,
        
        // Include original data for reference
        passType: row.r_pricingoption,
        MBSystemId_location: row.MBSystemId_location
      };
    });
    
    // STEP 3: Link with customer data
    setStep(3);
    setProgress(100);
    
    // This step would typically use the imported customer data
    // For now, we'll simulate this by using the externalId references
    const step3Data = step2Data.map(pass => {
      return pass; // In real implementation, would add customer IDs here
    });
    
    // Store the transformed data
    setTransformedData({
      passes: step3Data
    });
  };

  // MBO Waivers Transformation
  const mboWaiversTransformation = async () => {
    // Get the raw waiver data
    // In a real implementation, this would process the _Documents.zip file
    // For now, we'll simulate with the raw_waiver_locationName data
    const rawWaiverData = []; // Placeholder for waiver data extraction
    
    // STEP 1: Extract MBSystemId
    setStep(1);
    setProgress(33);
    
    // Simulated waiver data 
    const step1Data = rawWaiverData.length > 0 ? rawWaiverData : [
      { MBSystemId: 'waiver_placeholder_1' },
      { MBSystemId: 'waiver_placeholder_2' }
    ];
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(66);
    
    const step2Data = step1Data.map(row => {
      // Create externalId with location
      const externalId = `${row.MBSystemId}_${locationName}`;
      
      return {
        id: null, // Will be assigned by the DB
        name: null, // Will be filled with customer name in step 3
        address1: null, // Will be filled with customer address in step 3
        address2: null,
        city: null,
        state: null,
        postalCode: null,
        primaryPhone: null,
        email: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customerId: null, // Will be filled with customer ID in step 3
        envelopeId: null,
        templateId: null,
        url: null,
        envelopeUrl: null,
        status: 'signed',
        documentTitle: 'MBO Waiver',
        documents: JSON.stringify([{
          url: "placeholder_url", // This would be filled with actual URL in a real implementation
          name: "MindBody Waiver.pdf",
          description: "none"
        }]),
        dependents: null,
        startEffectiveDT: new Date().toISOString(),
        endEffectiveDT: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Default to 1 year expiration
        signedDT: new Date().toISOString(),
        source: null,
        UUID: uuidv4(),
        externalId,
        createdBy: null,
        updatedBy: null,
        signedById: null // Will be filled in step 3
      };
    });
    
    // STEP 3: Link with customer data
    setStep(3);
    setProgress(100);
    
    // This step would typically use the imported customer data
    // For now, we'll simulate this by using the externalId references
    const step3Data = step2Data.map(waiver => {
      return waiver; // In real implementation, would add customer details here
    });
    
    // Store the transformed data
    setTransformedData({
      waivers: step3Data
    });
  };

  // MBO Gift Cards Transformation
  const mboGiftCardsTransformation = async () => {
    // Get the raw gift card data
    const rawGiftCardData = parseResults['GiftCardsBalances.csv']?.data || [];
    
    // STEP 1: Extract relevant fields
    setStep(1);
    setProgress(33);
    
    const step1Data = rawGiftCardData
      .filter(row => parseFloat(row.CurrentBalance || 0) > 0)
      .map(row => ({
        DebitCardExtID: row.DebitCardExtID || '',
        CurrentBalance: row.CurrentBalance || '',
        DateIssued: row.DateIssued || '',
        location: locationName
      }));
    
    // STEP 2: Format data for our schema
    setStep(2);
    setProgress(66);
    
    const step2Data = step1Data.map(row => {
      // Format balance (remove $ sign)
      let balance = row.CurrentBalance;
      if (balance && balance.startsWith('$')) {
        balance = balance.substring(1);
      }
      
      // Format issue date
      let createdAt = new Date().toISOString();
      if (row.DateIssued) {
        const date = formatMboDate(row.DateIssued);
        if (date) {
          createdAt = date;
        }
      }
      
      return {
        id: null, // Will be assigned by the DB
        amount: balance,
        balance: balance,
        externalId: row.DebitCardExtID,
        isActive: 1,
        UUID: uuidv4(),
        createdAt,
        updatedAt: new Date().toISOString(),
        message: 'Externally Imported Giftcard'
      };
    });
    
    // STEP 3: Final formatting
    setStep(3);
    setProgress(100);
    
    // Store the transformed data
    setTransformedData({
      giftCards: step2Data
    });
  };

  // MBO Store Credit Transformation
  const mboStoreCreditTransformation = async () => {
    // Get the raw account balances data
    const rawAccountData = parseResults['AccountBalances.csv']?.data || [];
    
    // STEP 1: Extract relevant fields
    setStep(1);
    setProgress(25);
    
    const step1Data = rawAccountData
      .filter(row => parseFloat(row.balance || 0) > 0)
      .map(row => ({
        locationName,
        externalid: row.MBsystemid || '',
        balance: row.balance || ''
      }));
    
    // STEP 2: Format store credit data
    setStep(2);
    setProgress(50);
    
    const step2Data = step1Data.map(row => {
      // Create externalId with location
      const externalCustomerId = `${row.externalid}_${locationName}`;
      
      return {
        id: null, // Will be assigned by the DB
        customerId: null, // Will be filled with actual customer ID in step 3
        balance: row.balance,
        totalIssued: row.balance,
        totalUsed: 0,
        UUID: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: null,
        updatedBy: null,
        externalCustomerId // Temporary field for linking
      };
    });
    
    // STEP 3: Link with customer data
    setStep(3);
    setProgress(75);
    
    // This step would typically use the imported customer data
    // For now, we'll simulate this
    const step3Data = step2Data.map(credit => {
      return credit; // In real implementation, would add customer ID here
    });
    
    // STEP 4: Create store credit transactions
    setStep(4);
    setProgress(100);
    
    // Create a transaction for each store credit entry
    const transactionData = step3Data.map(credit => {
      return {
        id: null, // Will be assigned by the DB
        storecreditId: null, // Would be filled with actual ID after import
        customerId: credit.customerId,
        transactionId: null,
        giftcardId: null,
        staffId: null,
        pointsId: null,
        locationId: 1,
        currency: 'USD',
        type: 'CREDIT',
        amount: credit.balance,
        source: 'STAFF_ADJUSTMENT',
        reason: 'Credit imported from MBO',
        createdAt: credit.createdAt,
        updatedAt: credit.updatedAt,
        createdBy: null,
        updatedBy: null,
        externalId: credit.externalCustomerId
      };
    });
    
    // Store the transformed data
    setTransformedData({
      storeCredit: step3Data,
      storeCreditTransactions: transactionData
    });
  };

  // Utility function to format dates from RGP
  const formatRgpDate = (dateString) => {
    if (!dateString) return new Date().toISOString();
    
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
      const month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
      const day = parseInt(dateParts[1]);
      
      const date = new Date(year, month, day);
      return date.toISOString();
    }
    
    // Default fallback
    return new Date().toISOString();
  };

  // Utility function to format dates from MBO
  const formatMboDate = (dateString) => {
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
      return date.toISOString();
    }
    
    // Check for MM/DD/YYYY format
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[2]);
      const month = parseInt(dateParts[0]) - 1; // JS months are 0-indexed
      const day = parseInt(dateParts[1]);
      
      const date = new Date(year, month, day);
      return date.toISOString();
    }
    
    // Try YYYY-MM-DD format
    const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = dateString.match(isoDateRegex);
    if (isoMatch) {
      const year = parseInt(isoMatch[1]);
      const month = parseInt(isoMatch[2]) - 1;
      const day = parseInt(isoMatch[3]);
      
      const date = new Date(year, month, day);
      return date.toISOString();
    }
    
    // Default fallback
    return null;
  };

  // Utility function to calculate days between two dates
  const calculateDaysBetween = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 0;
    
    const startDate = new Date(formatRgpDate(startDateStr));
    const endDate = new Date(formatRgpDate(endDateStr));
    
    const differenceInTime = endDate.getTime() - startDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays > 0 ? differenceInDays : 0;
  };

  // Render the transformation UI
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Data Transformation</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Processing {importType} data from {provider}
          </h3>
        </div>
        
        {loading ? (
          <div className="my-6">
            <div className="mb-2 flex justify-between items-center">
              <span className="font-medium">Step {step}: {getStepName()}</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="my-6">
            {error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                <p className="font-bold">Transformation Complete</p>
                <p>Successfully transformed {getTransformedCount()} records.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Helper to get step name based on current step
  function getStepName() {
    switch (step) {
      case 1: return 'Extracting Data';
      case 2: return 'Formatting Fields';
      case 3: return 'Handling Relationships';
      case 4: return 'Finalizing';
      default: return 'Processing';
    }
  }
  
  // Helper to count transformed records
  function getTransformedCount() {
    let count = 0;
    
    // Count records in each transformed data category
    Object.values(transformedData).forEach(dataArray => {
      if (Array.isArray(dataArray)) {
        count += dataArray.length;
      }
    });
    
    return count;
  }
};

export default TransformationEngine;
