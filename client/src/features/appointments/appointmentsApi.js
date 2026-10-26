import { api } from '../../services/api';

export const appointmentsApi = {
  list: () => api.get('/appointments'),
  create: (payload) => api.post('/appointments', payload),
};
