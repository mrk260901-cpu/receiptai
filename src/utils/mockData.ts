/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Receipt, Budget, AppSettings } from '../types';

// Realistic mock receipts to pre-populate the local database on first run
export const INITIAL_RECEIPTS: Receipt[] = [
  {
    receiptId: 'rec-001',
    userId: 'user-01',
    storeName: 'Reliance Fresh',
    address: 'Phase 7, Industrial Area, Sector 62, Mohali, Punjab',
    phone: '+91 172 432 9901',
    date: '2026-07-01',
    time: '14:23',
    receiptNumber: 'RF-998311-2026',
    cashier: 'Rahul Sharma',
    items: [
      { name: 'Organic Milk 1L', quantity: 2, unitPrice: 75, totalPrice: 150 },
      { name: 'Basmati Rice Premium 5kg', quantity: 1, unitPrice: 650, totalPrice: 650 },
      { name: 'Whole Wheat Atta 10kg', quantity: 1, unitPrice: 420, totalPrice: 420 },
      { name: 'Amul Butter 500g', quantity: 1, unitPrice: 275, totalPrice: 275 },
      { name: 'Fresh Tomatoes 1kg', quantity: 2, unitPrice: 40, totalPrice: 80 },
      { name: 'Fresh Potatoes 2kg', quantity: 1, unitPrice: 60, totalPrice: 60 },
      { name: 'Saffola Gold Oil 2L', quantity: 1, unitPrice: 380, totalPrice: 380 }
    ],
    subtotal: 2015,
    tax: 95,
    discount: 100,
    total: 2010,
    currency: 'INR',
    paymentMethod: 'UPI',
    category: 'Groceries',
    confidenceScore: 0.98,
    createdAt: '2026-07-01T14:26:00Z',
    updatedAt: '2026-07-01T14:26:00Z'
  },
  {
    receiptId: 'rec-002',
    userId: 'user-01',
    storeName: 'Barbeque Nation',
    address: 'Elante Mall, Phase 1, Industrial Area, Chandigarh',
    phone: '+91 172 505 1234',
    date: '2026-07-04',
    time: '21:10',
    receiptNumber: 'BQ-55122-A',
    cashier: 'Server Rohit',
    items: [
      { name: 'Veg Buffet Dinner', quantity: 2, unitPrice: 850, totalPrice: 1700 },
      { name: 'Mocktail Blue Lagoon', quantity: 2, unitPrice: 150, totalPrice: 300 },
      { name: 'Chocolate Fudge Sizzler', quantity: 1, unitPrice: 220, totalPrice: 220 }
    ],
    subtotal: 2220,
    tax: 111,
    discount: 222,
    total: 2109,
    currency: 'INR',
    paymentMethod: 'Card',
    category: 'Restaurant',
    confidenceScore: 0.96,
    createdAt: '2026-07-04T21:15:00Z',
    updatedAt: '2026-07-04T21:15:00Z'
  },
  {
    receiptId: 'rec-003',
    userId: 'user-01',
    storeName: 'Shell Fuel Station',
    address: 'NH-21, Kharar Road, Mohali',
    phone: '+91 98765 43210',
    date: '2026-07-05',
    time: '08:45',
    receiptNumber: 'SH-8827-X',
    cashier: 'Fuel Pump 4',
    items: [
      { name: 'Shell V-Power Petrol (Liters)', quantity: 15, unitPrice: 110, totalPrice: 1650 }
    ],
    subtotal: 1650,
    tax: 0,
    discount: 50,
    total: 1600,
    currency: 'INR',
    paymentMethod: 'UPI',
    category: 'Fuel',
    confidenceScore: 0.99,
    createdAt: '2026-07-05T08:48:00Z',
    updatedAt: '2026-07-05T08:48:00Z'
  },
  {
    receiptId: 'rec-004',
    userId: 'user-01',
    storeName: 'Apollo Pharmacy',
    address: 'Sector 35-C, Chandigarh',
    phone: '+91 172 260 4010',
    date: '2026-06-28',
    time: '18:30',
    receiptNumber: 'AP-5049382',
    cashier: 'Ph. Amit Verma',
    items: [
      { name: 'Multivitamins Gold (30 tabs)', quantity: 1, unitPrice: 450, totalPrice: 450 },
      { name: 'Paracetamol 650mg (15 tabs)', quantity: 2, unitPrice: 30, totalPrice: 60 },
      { name: 'N95 Face Masks (Pack of 5)', quantity: 1, unitPrice: 250, totalPrice: 250 }
    ],
    subtotal: 760,
    tax: 40,
    discount: 50,
    total: 750,
    currency: 'INR',
    paymentMethod: 'Cash',
    category: 'Medical',
    confidenceScore: 0.95,
    createdAt: '2026-06-28T18:32:00Z',
    updatedAt: '2026-06-28T18:32:00Z'
  },
  {
    receiptId: 'rec-005',
    userId: 'user-01',
    storeName: 'ZARA India',
    address: 'Elante Mall, Chandigarh',
    phone: '+91 172 456 7000',
    date: '2026-06-25',
    time: '16:15',
    receiptNumber: 'ZR-229103',
    cashier: 'Neha S.',
    items: [
      { name: 'Slim Fit Cotton Shirt', quantity: 1, unitPrice: 2290, totalPrice: 2290 },
      { name: 'Chino Trousers Beige', quantity: 1, unitPrice: 2990, totalPrice: 2990 }
    ],
    subtotal: 5280,
    tax: 633,
    discount: 500,
    total: 5413,
    currency: 'INR',
    paymentMethod: 'Card',
    category: 'Shopping',
    confidenceScore: 0.97,
    createdAt: '2026-06-25T16:20:00Z',
    updatedAt: '2026-06-25T16:20:00Z'
  }
];

// Default budget limits per category
export const DEFAULT_BUDGETS: Budget[] = [
  { category: 'Groceries', monthlyLimit: 8000 },
  { category: 'Restaurant', monthlyLimit: 4000 },
  { category: 'Shopping', monthlyLimit: 10000 },
  { category: 'Medical', monthlyLimit: 2000 },
  { category: 'Fuel', monthlyLimit: 5000 },
  { category: 'Entertainment', monthlyLimit: 3000 },
  { category: 'Travel', monthlyLimit: 6000 },
  { category: 'Utilities', monthlyLimit: 4000 },
  { category: 'Electronics', monthlyLimit: 15000 },
  { category: 'Fashion', monthlyLimit: 8000 },
  { category: 'Sports', monthlyLimit: 3000 },
  { category: 'Others', monthlyLimit: 2000 }
];

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  currency: 'INR',
  darkMode: false,
  pushNotifications: true,
  emailAlerts: true
};

// Preset images for testing receipt scanner
// High resolution stylized SVG files embedded in base64 or represented as simulated canvas mock
export interface PresetReceiptOption {
  id: string;
  name: string;
  storeName: string;
  total: number;
  imageUrl: string;
  rawText: string;
}

export const PRESET_RECEIPTS: PresetReceiptOption[] = [
  {
    id: 'starbucks',
    name: 'Starbucks Coffee (Café)',
    storeName: 'Starbucks Coffee',
    total: 485,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rawText: `
      STARBUCKS COFFEE INDIA
      STORE #4429 - SECTOR 35 CHANDIGARH
      PH: +91 172 4629900
      
      DATE: 2026-07-06  TIME: 10:15 AM
      ORDER: 492003  REG: 2 CASHIER: ANANYA
      
      ITEMS:
      1   JAVA CHIP FRAPPUCCINO (TALL)     280.00
      1   DOUBLE CHOCOLATE COOKIE          150.00
      
      SUBTOTAL:                             430.00
      GST (12.79%):                         55.00
      TOTAL:                                485.00
      PAYMENT: CARD (Ending in *4829)
      
      THANK YOU FOR BREWING WITH US!
    `
  },
  {
    id: 'amazon',
    name: 'Amazon India (Electronics)',
    storeName: 'Amazon Retail',
    total: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rawText: `
      AMAZON SELLER SERVICES PVT LTD
      INVOICE # IN-883921-2026
      DATE: 2026-07-03  TIME: 18:45
      
      SHIP TO: RAJA R.
      MOHALI, PUNJAB, INDIA
      
      PRODUCT SPECIFICATION:
      1   BOAT STONE 1000 BLUETOOTH SPEAKER   2999.00
      1   USB-C BRAIDED FAST CHARGE CABLE      500.00
      
      SUBTOTAL:                              3499.00
      IGST @ 18%:                            Included
      DISCOUNT:                              0.00
      GRAND TOTAL:                           3499.00
      PAYMENT METHOD: UPI (TRANSACTION ID: 938210392)
      
      WARRANTY INCLUDED. THANK YOU FOR SHOPPING!
    `
  },
  {
    id: 'walmart',
    name: 'Walmart Supercenter (Groceries)',
    storeName: 'Walmart Supercenter',
    total: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    rawText: `
      WALMART SUPERCENTER #3301
      1200 BROADWAY, CHANDIGARH UT
      PH: 1800-300-1100
      
      DATE: 2026-07-05 TIME: 16:30
      ST# 0403 OP# 0029329 TE# 01 TR# 0849
      
      GROCERY PRODUCTS:
      1   DANO WHOLE MILK POWDER 1KG        550.00
      2   TATA SALT 1KG @ 25.00              50.00
      1   FORTUNE SOYABEAN OIL 1L           150.00
      3   MAGGI 2-MIN NOODLES PACK @ 14.00   42.00
      1   ORGANIC HONEY 500G                250.00
      2   SURF EXCEL EASY WASH 1KG @ 135.00 270.00
      
      SUBTOTAL:                             1312.00
      MEMBER DISCOUNT:                       -62.00
      TOTAL TAX:                              0.00
      GRAND TOTAL PAID:                     1250.00
      PAYMENT: CARD (VISA *1223)
      
      ITEMS SCANNED: 10
      SAVINGS TODAY: 62.00
      THANK YOU FOR SHOPPING WALMART!
    `
  }
];
