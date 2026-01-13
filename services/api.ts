import { GAS_API_URL } from '../constants';

// Helper to handle GAS redirects and text responses
const fetchGas = async (action: string, params: Record<string, any> = {}) => {
  const query = new URLSearchParams({ action, ...params }).toString();
  try {
    const response = await fetch(`${GAS_API_URL}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { success: false, error: String(error) };
  }
};

export const api = {
  getMenu: () => fetchGas('getMenu'), // Legacy (kept for safety)
  getRestaurantItems: () => fetchGas('getRestaurantItems'), // New detailed menu
  getPromotions: () => fetchGas('getPromotions'),
  getFAQ: () => fetchGas('getFAQ'),
  getMember: (lineId: string) => fetchGas('getMember', { lineId }),
  registerMember: (data: any) => fetchGas('registerMember', { data: JSON.stringify(data) }),
  makeReservation: (data: any) => fetchGas('makeReservation', { data: JSON.stringify(data) }),
  getMemberReservations: (phone: string) => fetchGas('getMemberReservations', { phone }),
  
  // Admin functions
  getReservations: () => fetchGas('getReservations'),
  getStats: () => fetchGas('getStats'),
  updateReservationStatus: (id: string, status: string) => fetchGas('updateReservationStatus', { id, status }),
};