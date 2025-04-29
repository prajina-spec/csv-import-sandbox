import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
