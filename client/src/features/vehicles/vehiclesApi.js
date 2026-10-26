import { api } from '../../services/api';

export const vehiclesApi = {
  list: () => api.get('/vehicles'),
  create: (payload) => api.post('/vehicles', payload),
};
