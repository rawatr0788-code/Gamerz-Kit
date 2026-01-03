
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  tags: string[];
  qrCodeUrl: string;
  createdAt: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  userId: string;
  userName: string;
  receiverName: string;
  userEmail: string;
  phone: string;
  address: string;
  utr: string;
  screenshotUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}
