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

    if (dataType === 'memberships') {
      rows.forEach(row => {
        if (!customerIds.includes(row.CUSTOMER_ID)) {
          errors.push(`Missing customer for ID ${row.CUSTOMER_ID}`);
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
      Object.values(emailMap).forEach(indices => {
        if (indices.length > 1) {
          indices.slice(1).forEach(i => {
            rows[i].secondary_email = (rows[i].secondary_email || '') 
              ? rows[i].secondary_email + '; ' + rows[i].email 
              : rows[i].email;
            rows[i].email = '';
          });
        }
      });
    }

    parsedData = rows;
    validationErrors = missingRows;

    res.json({ errors, cleanRows: rows, missingRows });
  },

  exportCleanCsv: async (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=clean_import.csv');
    res.set('Content-Type', 'text/csv');
    const ws = csv.format({ headers: true });
    ws.pipe(res);
    parsedData.forEach(row => ws.write(row));
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
