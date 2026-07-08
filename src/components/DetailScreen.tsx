/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Calendar, Clock, DollarSign, Tag, CreditCard, ShoppingBag, Hash, Sparkles } from 'lucide-react';
import { Receipt, ReceiptItem } from '../types';

interface DetailScreenProps {
  receipt: Receipt;
  currencySymbol: string;
  onSave: (updatedReceipt: Receipt) => void;
  onBack: () => void;
}

export default function DetailScreen({
  receipt,
  currencySymbol,
  onSave,
  onBack
}: DetailScreenProps) {
  
  // State variables synchronized with the receipt
  const [storeName, setStoreName] = useState(receipt.storeName);
  const [date, setDate] = useState(receipt.date);
  const [time, setTime] = useState(receipt.time || '12:00');
  const [receiptNumber, setReceiptNumber] = useState(receipt.receiptNumber || '');
  const [cashier, setCashier] = useState(receipt.cashier || '');
  const [address, setAddress] = useState(receipt.address || '');
  const [phone, setPhone] = useState(receipt.phone || '');
  
  const [items, setItems] = useState<ReceiptItem[]>([...receipt.items]);
  const [subtotal, setSubtotal] = useState(receipt.subtotal);
  const [tax, setTax] = useState(receipt.tax);
  const [discount, setDiscount] = useState(receipt.discount);
  const [total, setTotal] = useState(receipt.total);
  
  const [category, setCategory] = useState(receipt.category);
  const [paymentMethod, setPaymentMethod] = useState(receipt.paymentMethod);
  const [currency, setCurrency] = useState(receipt.currency);

  // Recalculate subtotal and total whenever items list, tax, or discount changes
  useEffect(() => {
    const computedSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(computedSubtotal);
    setTotal(Math.max(0, computedSubtotal + tax - discount));
  }, [items, tax, discount]);

  // Handle updates to specific items
  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'name') {
      item.name = value;
    } else if (field === 'quantity') {
      item.quantity = parseInt(value) || 1;
      item.totalPrice = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = parseFloat(value) || 0.0;
      item.totalPrice = item.quantity * item.unitPrice;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // Add Item
  const handleAddItem = () => {
    setItems([
      ...items,
      { name: 'New Item', quantity: 1, unitPrice: 0.0, totalPrice: 0.0 }
    ]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    } else {
      alert("Receipt must have at least one line item.");
    }
  };

  // Save changes to parent state and trigger navigation back
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert("Please specify a store name.");
      return;
    }
    if (!date) {
      alert("Please specify a date.");
      return;
    }

    const updatedReceipt: Receipt = {
      ...receipt,
      storeName,
      date,
      time,
      receiptNumber,
      cashier,
      address,
      phone,
      items,
      subtotal,
      tax,
      discount,
      total,
      category,
      paymentMethod,
      currency,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedReceipt);
  };

  const categories = [
    'Groceries', 'Restaurant', 'Shopping', 'Medical', 'Fuel', 
    'Education', 'Entertainment', 'Travel', 'Utilities', 
    'Electronics', 'Fashion', 'Sports', 'Others'
  ];

  const paymentMethods = ['Cash', 'Card', 'UPI', 'Mobile Wallet', 'Net Banking'];
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];

  return (
    <div className="flex-1 bg-slate-900 flex flex-col relative pb-20 overflow-hidden select-none">
      
      {/* Top sticky header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl transition cursor-pointer border border-slate-800"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-bold font-display text-white">Edit Receipt Details</span>
        <button
          onClick={handleSaveSubmit}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer"
        >
          <Save size={14} /> Save
        </button>
      </div>

      {/* Main Form content Scroller */}
      <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Confidence rating and premium scanner icon */}
        {receipt.confidenceScore && (
          <div className="glass-panel border-emerald-500/10 bg-emerald-500/5 px-4 py-3 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-bold font-display flex items-center gap-1.5">
              <Sparkles size={14} className="animate-pulse" /> Gemini Extraction Succeeded
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {(receipt.confidenceScore * 100).toFixed(0)}% Match
            </span>
          </div>
        )}

        {/* Visual Receipt Canvas image banner */}
        {receipt.receiptImage && (
          <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <img 
              src={receipt.receiptImage} 
              alt="Receipt image source" 
              className="h-full w-full object-cover blur-sm opacity-35" 
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img 
                src={receipt.receiptImage} 
                alt="Source receipt preview" 
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl border border-slate-800" 
              />
            </div>
          </div>
        )}

        {/* Store Metadata block */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Store Information</h4>
          
          <div className="glass-panel border border-slate-800 p-4 rounded-2xl space-y-4">
            {/* Store Name input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Merchant Name</label>
              <div className="relative">
                <ShoppingBag size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                  placeholder="e.g. Starbucks, Walmart"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Store Address"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Phone Number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction stats metadata block */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Transaction Metrics</h4>
          
          <div className="glass-panel border border-slate-800 p-4 rounded-2xl space-y-4">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Date</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Time</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 14:35"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Receipt invoice number & cashier */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Receipt No.</label>
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="e.g. ZR-8849"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Cashier</label>
                <input
                  type="text"
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                  placeholder="e.g. Server Rohit"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories, Currencies, and Payment dropdowns */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Classifications</h4>
          
          <div className="glass-panel border border-slate-800 p-4 rounded-2xl grid grid-cols-3 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
              >
                {paymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Line Items Table section */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Line Items</h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/5 px-2.5 py-1.5 rounded-lg border border-blue-500/10 cursor-pointer"
            >
              <Plus size={11} /> Add Item
            </button>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/65">
            {items.map((item, index) => (
              <div key={index} className="p-3.5 flex items-center gap-3 relative group">
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Name field */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent focus:border-slate-700 text-xs text-white font-bold py-0.5 outline-none truncate"
                    placeholder="Item Description"
                  />
                  
                  {/* Quantity and Unit price modifiers */}
                  <div className="flex gap-4 items-center text-[11px] text-slate-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <span>Qty:</span>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-10 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 outline-none font-mono text-center text-slate-200"
                        min="1"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Price ({currencySymbol}):</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 outline-none font-mono text-center text-slate-200"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-white pr-2">
                    {currencySymbol}{item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aggregated Totals block */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Financial Summary</h4>
          
          <div className="glass-panel border border-slate-800 p-4 rounded-2xl space-y-3 text-xs font-bold text-slate-300">
            
            {/* Subtotal */}
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-mono text-white">{currencySymbol}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tax / GST</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 rounded-lg px-2 py-0.5 font-mono text-slate-300">
                <span>{currencySymbol}</span>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0.0)}
                  className="w-12 bg-transparent outline-none text-right font-bold text-white"
                  step="0.1"
                />
              </div>
            </div>

            {/* Discount */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Discount Applied</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 rounded-lg px-2 py-0.5 font-mono text-slate-300">
                <span>{currencySymbol}</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0.0)}
                  className="w-12 bg-transparent outline-none text-right font-bold text-white"
                  step="0.1"
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-3.5 border-t border-slate-800 text-sm">
              <span className="text-white font-display">Grand Total</span>
              <span className="font-mono font-extrabold text-blue-400 text-lg">
                {currencySymbol}{total.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
              </span>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
