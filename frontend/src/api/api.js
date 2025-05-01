import axios from 'axios';

// Use relative URL in production, full URL in development
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:4000/api';

const api = axios.create({ baseURL });

export const parseCsv = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/parse', form);
};

export const validateData = (dataType, rows) =>
  api.post('/upload/validate', { dataType, rows });

export const importData = (dataType, rows) =>
  api.post('/upload/import', { dataType, rows });

export const fetchMembershipTypes = () => 
  api.get('/upload/membership-types');
