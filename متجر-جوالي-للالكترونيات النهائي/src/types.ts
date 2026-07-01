export type Category = string;

export interface StoreCategory {
  id: string;
  label: string;
  icon?: string;
  image?: string;
  order: number;
  active: boolean;
  desc?: string;
  badge?: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  subCategory?: 'airpods' | 'overear' | 'speakers' | 'wired';
  images: string[];
  stock: number;
  brand: string;
  rating: number;
  specs: { [key: string]: string };
  condition?: 'new' | 'used';
  displayOrder?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  blocked?: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: 'cod' | 'bank_transfer';
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeLogo: string;
  favicon: string;
  contactNumbers: string;
  emailAddress: string;
  whatsappNumber: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialTiktok: string;
  homepageBanners: string[];
  homepageAnnouncement: string;
  footerInformation: string;
  shippingFees?: { code: string; name: string; shippingFee: number; deliveryTime: string }[];
  paymentMethods?: ('cod' | 'bank_transfer')[];
  categories?: StoreCategory[];
  updatedAt?: string;
}

