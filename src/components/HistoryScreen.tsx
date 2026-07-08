/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, Trash2, Edit3, X, ChevronDown, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Receipt } from '../types';

interface HistoryScreenProps {
  receipts: Receipt[];
  currencySymbol: string;
  onSelectReceipt: (receipt: Receipt) => void;
  onDeleteReceipt: (id: string) => void;
}

type RelativeFilterType = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year';

export default function HistoryScreen({
  receipts,
  currencySymbol,
  onSelectReceipt,
  onDeleteReceipt
}: HistoryScreenProps) {
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRelativeDate, setActiveRelativeDate] = useState<RelativeFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxAmount, setMaxAmount] = useState<number>(10000);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Get list of unique categories in dataset for filters
  const uniqueCategories = useMemo(() => {
    const list = receipts.map(r => r.category);
    return ['All', ...Array.from(new Set(list))];
  }, [receipts]);

  // Filtered Receipts Calculation
  const filteredReceipts = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    // This week (7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // This month (30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return receipts.filter(receipt => {
      // 1. Search Query Match (Store Name, Items, Receipt Number, Category)
      const matchesSearch = 
        receipt.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (receipt.receiptNumber && receipt.receiptNumber.includes(searchQuery)) ||
        receipt.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Relative Date Match
      if (activeRelativeDate !== 'all') {
        const rDateStr = receipt.date; // YYYY-MM-DD
        if (activeRelativeDate === 'today' && rDateStr !== todayStr) return false;
        if (activeRelativeDate === 'yesterday' && rDateStr !== yesterdayStr) return false;
        
        const rDate = new Date(rDateStr);
        if (activeRelativeDate === 'week' && rDate < sevenDaysAgo) return false;
        if (activeRelativeDate === 'month' && rDate < thirtyDaysAgo) return false;
        if (activeRelativeDate === 'year' && rDate.getFullYear() !== now.getFullYear()) return false;
      }

      // 3. Category Match
      if (selectedCategory !== 'All' && receipt.category !== selectedCategory) {
        return false;
      }

      // 4. Amount Range Match
      if (receipt.total > maxAmount) {
        return false;
      }

      return true;
    });
  }, [receipts, searchQuery, activeRelativeDate, selectedCategory, maxAmount]);

  // Format dates for friendly view
  const formatDateFriendly = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Groceries': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Restaurant': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Shopping': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Fuel': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Medical': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Utilities': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const clearFilters = () => {
    setActiveRelativeDate('all');
    setSelectedCategory('All');
    setMaxAmount(10000);
    setSearchQuery('');
  };

  return (
    <div className="flex-1 bg-slate-900 flex flex-col relative pb-20 overflow-hidden">
      
      {/* Top Search Toolbar Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-white">Scanned Receipts</h2>
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`p-2 rounded-xl transition cursor-pointer border ${showFilterDrawer ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-850 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Input Text Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by store, items, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Horizontal Scroll Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
          <button
            onClick={() => setActiveRelativeDate('all')}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${activeRelativeDate === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-850 border-slate-800 text-slate-400'}`}
          >
            All Dates
          </button>
          <button
            onClick={() => setActiveRelativeDate('today')}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${activeRelativeDate === 'today' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-850 border-slate-800 text-slate-400'}`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveRelativeDate('yesterday')}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${activeRelativeDate === 'yesterday' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-850 border-slate-800 text-slate-400'}`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setActiveRelativeDate('week')}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${activeRelativeDate === 'week' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-850 border-slate-800 text-slate-400'}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setActiveRelativeDate('month')}
            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${activeRelativeDate === 'month' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-850 border-slate-800 text-slate-400'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Advanced Drawer Filter panel */}
      {showFilterDrawer && (
        <div className="bg-slate-950 border-b border-slate-800 p-4 shrink-0 space-y-4 animate-slideDown">
          {/* Category Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Category Filter</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Slider Amount range */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold">
                <span className="text-slate-400">Max Amount</span>
                <span className="text-blue-400 font-mono">{currencySymbol}{maxAmount}</span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="250"
                value={maxAmount}
                onChange={(e) => setMaxAmount(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none accent-blue-500 outline-none mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-[11px] font-bold">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-250 hover:bg-slate-800/50 transition cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* Main List Scroller */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredReceipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="text-slate-600 mb-3" size={32} />
            <h5 className="text-sm font-bold text-slate-300">No Receipts Match Search</h5>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
              Try editing your search query, choosing a different date range, or removing advanced filters.
            </p>
          </div>
        ) : (
          filteredReceipts.map((receipt) => (
            <div
              key={receipt.receiptId}
              className="glass-panel border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 group relative overflow-hidden transition"
            >
              {/* Visual click overlay targeting details */}
              <div 
                onClick={() => onSelectReceipt(receipt)} 
                className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
              >
                {/* Simulated Thumbnail */}
                <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden">
                  {receipt.receiptImage ? (
                    <img src={receipt.receiptImage} className="w-full h-full object-cover" alt="receipt" />
                  ) : (
                    <span className="text-sm text-slate-400 font-bold uppercase">{receipt.storeName[0]}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 truncate pr-2">{receipt.storeName}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <Calendar size={11} />
                    <span>{formatDateFriendly(receipt.date)}</span>
                    <span className="text-slate-600">•</span>
                    <span>{receipt.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Action and Pricing Panel */}
              <div className="text-right shrink-0 flex items-center gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-white">
                    {currencySymbol}{receipt.total.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </p>
                  <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${getCategoryColor(receipt.category)}`}>
                    {receipt.category}
                  </span>
                </div>

                {/* Delete direct button */}
                <button
                  onClick={() => onDeleteReceipt(receipt.receiptId)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0 cursor-pointer"
                  title="Delete Receipt"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
