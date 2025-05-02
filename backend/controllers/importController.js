const fs = require('fs');
const csv = require('fast-csv');

// In-memory storage
let parsedData = [];
let validationErrors = [];

module.exports = {
  parseCsv: async (req, res) => {
    const rows = [];
    fs.createReadStream(req.file.path)
      .pipe(csv.parse({ headers: true, skipRows: 0 }))
      .on('error', error => res.status(400).json({ error: error.message }))
      .on('data', row => rows.push(row))
      .on('end', () => {
        parsedData = rows;
        validationErrors = []; // reset
        res.json({ headers: Object.keys(rows[0] || {}), rowsCount: rows.length });
      });
  },

  validateData: async (req, res) => {
    const { dataType, rows, customerIds = [] } = req.body;
    const errors = [];
    const missingRows = [];
    const rowErrors = {};

    // Add row index metadata to track the original position
    rows.forEach((row, index) => {
      row._rowIndex = index;
    });

    if (dataType === 'memberships') {
      // For now, we'll simulate customerIds for validation
      // In a real scenario, you would fetch actual customer IDs from your database
      const mockCustomerIds = ['CUST1', 'CUST2', 'CUST3'];
      
      rows.forEach((row, index) => {
        const customerId = row.customerId || row.CUSTOMER_ID;
        if (!mockCustomerIds.includes(customerId)) {
          const errorMsg = `Missing customer for ID ${customerId}`;
          errors.push(errorMsg);
          
          // Mark this row as having an error
          if (!rowErrors[index]) {
            rowErrors[index] = [];
          }
          rowErrors[index].push(errorMsg);
          
          missingRows.push({ ...row, Notes: 'Missing customer' });
        }
      });
    }

    // Handle duplicate emails (customers only)
    if (dataType === 'customers') {
      const emailMap = {};
      rows.forEach((row, idx) => {
        const email = row.email?.trim().toLowerCase();
        if (email) {
          if (!emailMap[email]) emailMap[email] = [idx];
          else emailMap[email].push(idx);
        }
      });
      
      Object.entries(emailMap).forEach(([email, indices]) => {
        if (indices.length > 1) {
          // Mark duplicate emails as errors and track which rows have this issue
          const errorMsg = `Duplicate email: ${email} found in multiple rows`;
          errors.push(errorMsg);
          
          indices.forEach(idx => {
            if (!rowErrors[idx]) {
              rowErrors[idx] = [];
            }
            rowErrors[idx].push(errorMsg);
          });
          
          // Handle duplicates by moving to secondary email
          indices.slice(1).forEach(i => {
            rows[i].secondary_email = (rows[i].secondary_email || '') 
              ? rows[i].secondary_email + '; ' + rows[i].email 
              : rows[i].email;
            rows[i].email = '';
          });
        }
      });
    }

    // Store validated data
    parsedData = rows;
    validationErrors = missingRows;

    res.json({ 
      errors, 
      cleanRows: rows, 
      missingRows,
      rowErrors
    });
  },

  updateValidatedData: async (req, res) => {
    const { updatedRows } = req.body;
    
    if (updatedRows && Array.isArray(updatedRows)) {
      // Update our in-memory storage with the user-edited data
      parsedData = updatedRows;
      
      // Re-run validation on the updated data
      const errors = [];
      const missingRows = [];
      
      // You can add your validation logic here if needed
      
      res.json({ 
        success: true, 
        message: 'Data updated successfully',
        errors,
        missingRows
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid data format' 
      });
    }
  },

  exportCleanCsv: async (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=clean_import.csv');
    res.set('Content-Type', 'text/csv');
    const ws = csv.format({ headers: true });
    ws.pipe(res);
    
    // Filter out internal tracking fields
    parsedData.forEach(row => {
      const cleanRow = { ...row };
      delete cleanRow._rowIndex;
      ws.write(cleanRow);
    });
    
    ws.end();
  },

  exportErrorCsv: async (req, res) => {
    if (validationErrors.length === 0) {
      return res.status(400).json({ error: 'No validation errors found' });
    }
    res.setHeader('Content-disposition', 'attachment; filename=error_report.csv');
    res.set('Content-Type', 'text/csv');
    const ws = csv.format({ headers: true });
    ws.pipe(res);
    validationErrors.forEach(row => ws.write(row));
    ws.end();
  },

  getMembershipTypes: async (req, res) => {
    res.json([
      { id: 1, name: 'Membership 1' },
      { id: 2, name: 'Membership 2' }
    ]);
  }
};
