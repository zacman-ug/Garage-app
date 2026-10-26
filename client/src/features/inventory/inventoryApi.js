import { adjustInventory, fetchInventory } from '../../services/api';

export const inventoryApi = {
  list: () => fetchInventory(),
  adjust: (payload) => adjustInventory(payload),
};
