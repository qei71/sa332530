export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  // Advanced options
  tags?: string[]; // 'spicy', 'beef', 'vegetarian'
  hasNoodleSelection?: boolean; // For Pasta
  allowCombo?: boolean; // Allow upsell
  isDrink?: boolean;
}

export interface CartItem extends MenuItem {
  uniqueId: string; // For distinguishing same item with different options
  quantity: number;
  selectedNoodle?: string;
  noodlePrice?: number;
  selectedCombo?: string;
  comboPrice?: number;
  selectedDrink?: string;
  note?: string; // e.g. Spicy level
}

export interface Reservation {
  id?: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  pax: number;
  items?: string; // JSON string of pre-ordered items
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  tableId?: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface Member {
  id: string;
  lineId: string;
  name: string;
  phone: string;
  points: number;
  isAdmin: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  content: string;
  image: string;
  validUntil: string;
}

export interface PosStat {
  date: string;
  revenue: number;
  visitors: number;
}

export enum AppView {
  LOADING = 'LOADING',
  HOME = 'HOME',
  MENU = 'MENU', // Picture Menu
  RESERVATION = 'RESERVATION', // Booking + Pre-order
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  FAQ = 'FAQ',
  LOCATION = 'LOCATION'
}

export const NOODLE_OPTIONS = [
  { name: '筆尖麵', price: 0 },
  { name: '燉飯', price: 0 },
  { name: '天使細麵', price: 10 },
  { name: '通心麵', price: 10 },
  { name: '細扁麵', price: 10 },
  { name: '墨魚麵', price: 40 },
];

export const COMBO_OPTIONS = [
  { id: 'none', name: '單點', price: 0 },
  { id: 'A', name: '超值套餐 (+濃湯+麵包+飲品)', price: 80 },
  { id: 'B', name: '酥皮套餐 (+酥皮濃湯+飲品)', price: 130 },
];
