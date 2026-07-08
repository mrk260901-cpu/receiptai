/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Receipt {
  receiptId: string;
  userId: string;
  storeName: string;
  address?: string;
  phone?: string;
  date: string;
  time?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  category: string;
  receiptImage?: string; // base64 string or image URL
  receiptNumber?: string;
  cashier?: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  category: string;
  monthlyLimit: number;
}

export interface SpendingInsight {
  type: 'info' | 'warning' | 'success';
  title: string;
  text: string;
  metric?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  joinedAt: string;
}

export interface AppSettings {
  language: 'en' | 'hi' | 'es';
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';
  darkMode: boolean;
  pushNotifications: boolean;
  emailAlerts: boolean;
}
