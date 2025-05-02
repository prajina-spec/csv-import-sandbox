# Approach CSV Import Tool

A comprehensive tool for data migration into the Approach CRM system, supporting imports from Rock Gym Pro, MindBody Online, and other systems.

## Features

- **Provider Detection**: Automatically detects the source system from uploaded CSV files
- **Multiple File Import**: Supports uploading multiple related data files in a single process
- **Relational Data Handling**: Maintains relationships between different data types (customers, memberships, etc.)
- **Data Transformation**: Applies provider-specific transformations based on business rules
- **Data Validation**: Provides a guided validation process with checklists
- **Data Editing**: Allows correcting issues before final import
- **Export Options**: Exports transformed data as CSV files for use in the main system

## Project Structure

```
frontend/
  ├── src/
  │   ├── components/
  │   │   ├── ProviderDetection.jsx    # File upload and provider detection
  │   │   ├── TransformationEngine.jsx # Transforms raw data to Approach format
  │   │   ├── DataEditor.jsx           # Interface for data editing 
  │   │   ├── ValidationChecklist.jsx  # Guided validation process
  │   │   └── ImportSummary.jsx        # Final import summary and export options
  │   ├── utils/
  │   │   ├── transformations/
  │   │   │   └── transformUtils.js    # Shared transformation functions
  │   └── App.jsx                      # Main application component
```

## Workflow

1. **Provider Detection**: Upload data files from your previous system
   - The system automatically detects if you're importing from RGP, MBO, or another system
   - Select which data types to import (customers, memberships, passes, etc.)

2. **Data Transformation**: Raw data is converted to Approach format
   - Provider-specific transformations are applied
   - External IDs are created to maintain relationships
   - Data is formatted according to Approach's database schema

3. **Data Editing**: Review and edit transformed data
   - Filter and search data
   - Edit values directly in the table
   - Delete unwanted rows
   - Validate data integrity

4. **Validation**: Follow guided validation checklists
   - Check specific aspects of each data type
   - Add notes for future reference
   - All validations must be completed before proceeding

5. **Import Summary**: Review and export the final data
   - See statistics for each imported data type
   - Download transformed data as CSV files
   - Export all data as a ZIP archive for easy sharing

## Data Transformations

The system performs various transformations on the imported data:

### Common Transformations
- Creating unique external IDs for each entity
- Formatting dates to ISO format
- Standardizing phone numbers to E.164 format
- Handling duplicate emails and barcodes
- Setting default values for required fields

### RGP-Specific Transformations
- Converting membership types from RGP's format
- Calculating billing dates for recurring memberships
- Summing punch passes
- Handling membership status (active, frozen, etc.)

### MBO-Specific Transformations
- Processing both recurring and non-recurring memberships
- Handling membership relationships (sharing)
- Converting certification types
- Formatting store credit data

## Implementation Notes

- The tool follows a step-by-step process for each data type
- Each transformation step is modeled after the SQL scripts currently used
- The UI provides feedback at each stage of the process
- The system handles validation checks for data integrity
- External IDs are used to maintain relationships between entities

## Usage

1. Start by clicking "Upload Files" and selecting files from your previous system
2. The system will detect the provider and show available import types
3. Select which data types to import
4. Follow the guided process through transformation, editing, and validation
5. Download the final CSV files for import into Approach

## Development

To run this project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Notes on SQL Scripts

The transformation logic is based on the existing SQL scripts used for data migration. The same multi-step approach is followed:

1. Extract raw data from provider files
2. Format data according to Approach standards
3. Handle special cases (duplicates, nulls, etc.)
4. Create lookup tables for relational data
5. Output final data in the correct format for import
