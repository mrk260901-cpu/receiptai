/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Plus, Receipt as ReceiptIcon, Calendar, ArrowUpRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { Receipt, Budget } from '../types';

interface DashboardScreenProps {
  receipts: Receipt[];
  budgets: Budget[];
  currencySymbol: string;
  activeCurrency: string;
  onNavigate: (screen: string) => void;
  onSelectReceipt: (receipt: Receipt) => void;
}

export default function DashboardScreen({
  receipts,
  budgets,
  currencySymbol,
  activeCurrency,
  onNavigate,
  onSelectReceipt
}: DashboardScreenProps) {
  
  // Calculate analytics
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM
  
  // Total Spent this month
  const currentMonthReceipts = receipts.filter(r => r.date.startsWith(currentMonthStr));
  const totalSpentThisMonth = currentMonthReceipts.reduce((sum, r) => sum + r.total, 0);

  // Total budgets limits
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  
  // Remaining budget
  const budgetRemaining = Math.max(0, totalBudgetLimit - totalSpentThisMonth);
  const budgetPercentSpent = totalBudgetLimit > 0 ? (totalSpentThisMonth / totalBudgetLimit) * 100 : 0;
  
  // Category Breakdown for warning alerts
  const spendingByCategory = currentMonthReceipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.total;
    return acc;
  }, {} as Record<string, number>);

  const alerts = budgets
    .map(b => {
      const spent = spendingByCategory[b.category] || 0;
      const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      return { category: b.category, percent, spent, limit: b.monthlyLimit };
    })
    .filter(a => a.percent >= 80)
    .sort((a, b) => b.percent - a.percent);

  // Recent scanned receipts (Limit to 4)
  const recentReceipts = [...receipts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  // Date formatter helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Category Icon helper
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

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-5 bg-slate-900 scrollbar-none">
      
      {/* Dynamic welcome header with decorative glass background */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-display">RECEIPTAI MOBILE</span>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Financial Hub</h2>
        </div>
        <div className="relative">
          <button 
            onClick={() => onNavigate('scan')} 
            className="p-2.5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition cursor-pointer"
          >
            <Sparkles size={18} />
          </button>
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Main Premium Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 shadow-xl shadow-blue-900/30">
        {/* Absolute Background Circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/25 rounded-full blur-2xl" />

        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">Total Spent This Month</p>
            <h3 className="text-3xl font-extrabold text-white mt-1.5 font-display flex items-baseline gap-1">
              <span className="text-xl font-normal text-blue-200">{currencySymbol}</span>
              {totalSpentThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[10px] font-semibold text-white uppercase border border-white/15">
            July 2026
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-blue-100">Monthly Budget Usage</span>
            <span className="text-white font-semibold">{budgetPercentSpent.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-blue-950/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${budgetPercentSpent > 90 ? 'bg-rose-400' : budgetPercentSpent > 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, budgetPercentSpent)}%` }}
            />
          </div>
        </div>

        {/* Balance metrics footer */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10 text-xs">
          <div>
            <span className="text-blue-200 block">Remaining Budget</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {currencySymbol}{budgetRemaining.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-blue-200 block">Scanned Receipts</span>
            <span className="text-sm font-bold text-white mt-0.5 block flex items-center justify-end gap-1">
              <ReceiptIcon size={14} className="text-blue-300" />
              {currentMonthReceipts.length} this month
            </span>
          </div>
        </div>
      </div>

      {/* Smart spending advice prompt pill */}
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 border border-slate-800 relative">
        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 shrink-0">
          <TrendingUp size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Smart Spend Alert</p>
          <p className="text-xs text-slate-300 truncate mt-0.5">
            {alerts.length > 0 
              ? `Budget alert: ${alerts[0].category} is at ${alerts[0].percent.toFixed(0)}% of limit!`
              : "Great job! All category budgets are currently under control."
            }
          </p>
        </div>
        <button 
          onClick={() => onNavigate('analytics')} 
          className="text-xs text-blue-400 font-semibold flex items-center gap-0.5 bg-blue-500/5 hover:bg-blue-500/10 px-2.5 py-1.5 rounded-lg shrink-0 transition"
        >
          View Insights <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Recent Receipts List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold font-display text-slate-200">Recent Receipts</h4>
          <button 
            onClick={() => onNavigate('history')} 
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition cursor-pointer"
          >
            See All History
          </button>
        </div>

        {recentReceipts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border-dashed border-slate-800">
            <ReceiptIcon className="mx-auto text-slate-600 mb-3" size={36} />
            <p className="text-sm text-slate-400">No receipts scanned yet</p>
            <p className="text-xs text-slate-500 mt-1">Tap the camera button below to scan your first receipt</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentReceipts.map((receipt) => (
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectReceipt(receipt)}
                key={receipt.receiptId}
                className="glass-panel hover:bg-slate-800/40 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  {/* Category stylized icon placeholder or image thumbnail */}
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden">
                    {receipt.receiptImage ? (
                      <img src={receipt.receiptImage} className="w-full h-full object-cover" alt="receipt" />
                    ) : (
                      <ReceiptIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100 truncate max-w-[130px]">{receipt.storeName}</h5>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <Calendar size={11} />
                      <span>{formatDate(receipt.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">
                    {currencySymbol}{receipt.total.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </p>
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 border uppercase tracking-wider ${getCategoryColor(receipt.category)}`}>
                    {receipt.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Quick-Scan Button (Centered for Mobile navigation aesthetics) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('scan')}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-900/45 text-white border-2 border-slate-900 cursor-pointer"
        >
          <Plus size={28} className="stroke-[2.5]" />
        </motion.button>
      </div>

    </div>
  );
}
