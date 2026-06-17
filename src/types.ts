/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'racket' | 'shoes' | 'bag' | 'string' | 'clothes' | 'combo';
  categoryName: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  imageEmoji: string;
  imageUrl?: string;
  isHot?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  discountPercent?: number;
  specs?: {
    weight?: string;      // e.g., "4U (Avg. 83g)", "3U (Avg. 88g)"
    balance?: string;     // e.g., "Even Balance", "Head Heavy", "Head Light"
    tension?: string;     // e.g., "20-28 lbs", "24-30 lbs"
    stiffness?: string;   // e.g., "Medium", "Stiff", "Flexible"
    material?: string;    // e.g., "High Elasticity Carbon"
    origin?: string;      // e.g., "Made in Japan", "Made in China"
  };
  description: string;
}

export interface CartItem {
  id: string; // Unique ID for cart item (product.id + tension string)
  product: Product;
  quantity: number;
  selectedTension?: string; // Standard stringing tension, e.g. "11kg (24lbs)"
}

export interface Voucher {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingNote?: string;
  paymentMethod: 'cod' | 'banking';
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed';
  createdAt: string;
}

export interface ConsultationRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  createdAt: string;
}
